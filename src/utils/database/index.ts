import { createPool, type Pool } from "mysql2/promise";

/**
 * Function to connect to MySQL Database
 * @returns mysql.Pool
 */
declare global {
  var connectionPool: Pool | undefined;
}

export async function getDBConnection() {
  if (!global.connectionPool) {
    global.connectionPool = createPool({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT as string, 10),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    });
  }
  return global.connectionPool;
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
