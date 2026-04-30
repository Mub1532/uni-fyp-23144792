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
export function insertHelper(
  tableName: string,
  data: Record<string, unknown>,
  extra?: string,
) {
  const names = Object.keys(data);
  const values = Object.values(data);
  const valuesAmount = values.map(() => "?").join(",");

  const sql = `INSERT INTO ${tableName} (${names.join(`,`)}) VALUES (${valuesAmount}) ${extra ?? ``};`;

  return {
    sql,
    values,
  };
}

/**
 * Helper function to insert stuff into database in bulk
 * @param tableName
 * @param data
 * @returns
 */
export function insertHelperBulk(
  tableName: string,
  data: Record<string, unknown>[],
  extra?: string,
  ignoreDuplicates?: boolean,
) {
  const names = Object.keys(data[0]);
  const placeholders = data
    .map(() => `(${names.map(() => "?").join(",")})`)
    .join(", ");
  const values = data.flatMap((row) => Object.values(row));

  const sql = `INSERT ${ignoreDuplicates ? `IGNORE` : ``} INTO ${tableName} (${names.join(",")}) VALUES ${placeholders} ${extra ?? ``};`;

  return { sql, values };
}
