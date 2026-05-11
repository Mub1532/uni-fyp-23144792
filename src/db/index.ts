import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";
import * as schema from "./schema";

declare global {
  var connectionPool: Pool | undefined;
}

const pool =
  global.connectionPool ??
  createPool({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT as string, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  });

export const db = drizzle(pool, { schema, mode: "default" });
