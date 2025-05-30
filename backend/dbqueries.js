const dbpool = require('./db').promise();

const execSQL = async (query, params = []) => {
    const [results] = await dbpool.query(query, params);
    return results;
};

const InsertMsgToDB = async (msg) => {
    const sql = "INSERT INTO sensordata (deviceId, temperature, humidity, timestamp) VALUES (?,?,?,NOW());";
    const params = [msg.deviceId, msg.temperature, msg.humidity];
    try {
        await execSQL(sql, params);
    } catch (err) {
        return {
            error: true,
            message: err
        }
    }
    return {
        error: false
    }
};

// ✅ funktio Insights-datan hakemiseen
const GetDeviceInsights = async (deviceId) => {
    const sql = `
        SELECT 
            deviceId, 
            AVG(temperature) AS avgTemperature, 
            AVG(humidity) AS avgHumidity, 
            DATE_FORMAT(DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00'), INTERVAL 0 HOUR), '%Y-%m-%d %H:%i:%s') AS hourStart
        FROM sensordata
        WHERE deviceId = ?
            AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        GROUP BY deviceId
    `;
    try {
        const results = await execSQL(sql, [deviceId]);
        if (results.length > 0) {
            return {
                error: false,
                data: results[0]
            };
        } else {
            return {
                error: true,
                message: 'No data found for this device in the last hour'
            };
        }
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

module.exports = {
    InsertMsgToDB,
    GetDeviceInsights
};
