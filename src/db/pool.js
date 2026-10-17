import { Pool } from "pg";
import process from "node:process";
try {
  process.loadEnvFile();
} catch (e) {
  console.log(e);
}

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
