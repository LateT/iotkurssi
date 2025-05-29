const dbpool = require('./db').promise();

const execSQL = async (query, params = []) => {
    const [results] = await dbpool.query(query, params);
    return results;
};

const InsertMsgToDB = async (msg) => {
    const sql = "INSERT INTO sensordata (deviceId, temperature, humidity, timestamp) VALUES (?,?,?,NOW());";
    const params = Object.values(msg);
    try {
        await execSQL(sql,params);
    } catch (err) {
        return {
            error: true,
            message: err
        }
    }
    return {
        error: false
    }
}

module.exports = {
    InsertMsgToDB
};
