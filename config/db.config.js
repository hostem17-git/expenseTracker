import pg from "pg";
import dotenv from "dotenv";
dotenv.config();


const { Pool } = pg;

// console.log("in db config", process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
