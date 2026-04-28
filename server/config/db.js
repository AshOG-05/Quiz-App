const mysql = require("mysql2");

// Use a connection pool instead of a single connection for AWS RDS
// Pools automatically handle reconnects if the connection drops!
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "manager",
  database: process.env.DB_NAME || "quiz_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the pool connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB Connection Failed:", err.message);
  } else {
    console.log("✅ MySQL Connected via Pool!");
    connection.release(); // Return connection to the pool
  }
});

// Export the promise-wrapped pool (if you use promises later) or just the standard pool
module.exports = pool;