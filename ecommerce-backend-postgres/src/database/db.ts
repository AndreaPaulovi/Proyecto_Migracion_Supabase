
import { Pool } from "pg";
import ENV from "../config/env";
import fs from "node:fs";
import path from "node:path";

const caCertificate = fs.readFileSync(
  path.join(process.cwd(), "supabase-ca.crt"),
  "utf8"
);

const pool = new Pool({
  host: ENV.DATABASE_HOST,
  port: ENV.DATABASE_PORT,
  database: ENV.DATABASE_NAME,
  user: ENV.DATABASE_USER,
  password: ENV.DATABASE_PASSWORD,
  ssl: {
    ca: caCertificate,
    rejectUnauthorized: true,
  },
});

export default pool;
