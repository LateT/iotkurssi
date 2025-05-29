const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const pool = mysql.createPool({
    host: process.env.DBHOSTNAME,
    user: process.env.DBUSERNAME,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT,
    database: process.env.DBNAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'DigiCertGlobalRootCA.crt.pem'))
    }
});

module.exports = pool;