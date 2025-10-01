// DB
const mysql = require('mysql2/promise') ;
const dotenv =require('dotenv') ;
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') }); // tuy vao cho de file .env

// Connection pool
const connection  = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = connection;
console.log("DB_USER:", process.env.DB_USERNAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD)

async function testDbConnection() {
    try {
        console.log("🔄 Đang thử kết nối tới MySQL...");
        const [rows] = await connection.query("SELECT NOW() AS currentTime");
        console.log("✅ Kết nối thành công! Thời gian DB:", rows[0].currentTime);
    } catch (err) {
        console.error("❌ Lỗi khi kết nối DB:", err.message);
    } finally {
        // Đóng pool khi test xong để chương trình thoát
        await connection.end();
    }
}

testDbConnection();