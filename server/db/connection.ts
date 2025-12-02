import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "35.226.2.229",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USERNAME || "creatorsjam",
  password: process.env.DB_PASSWORD || "RLvEGam6O79wGkeZVaxsCu85rjhBWR",
  database: process.env.DB_DATABASE || "UC",
  charset: process.env.DB_CHARSET || "utf8",
  timezone: "+05:30", // IST timezone
  waitForConnections: true,
  connectionLimit: 20, // Increased from 10 to 20
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export async function getConnection() {
  return await pool.getConnection();
}

export default pool;

