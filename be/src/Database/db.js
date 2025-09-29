// DB
const mysql = require('mysql2/promise') ;
const dotenv =require('dotenv') ;
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') }); // tuy vao cho de file .env

// Connection pool
const connection  = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = connection;
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD)

