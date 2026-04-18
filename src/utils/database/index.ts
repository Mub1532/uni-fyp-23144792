import { createPool, type Pool } from "mysql2/promise";

/**
 * Function to connect to MySQL Database
 * @returns mysql.Pool
 */
let connectionPool: Pool;

export async function getDBConnection() {
  if (!connectionPool) {
    connectionPool = createPool({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT as string, 10),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
    });
  }
  return connectionPool;
}

/**
 * Helper function to insert stuff into database
 * @param tableName
 * @param data
 * @returns
 */
export function insertHelper(tableName: string, data: Record<string, unknown>) {
  const names = Object.keys(data);
  const values = Object.values(data);
  const valuesAmount = values.map(() => "?").join(",");

  const sql = `INSERT INTO ${tableName} (${names.join(`,`)}) VALUES (${valuesAmount});`;

  return {
    sql,
    values,
  };
}
