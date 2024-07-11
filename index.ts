import "dotenv/config";
import mysql from "mysql2/promise";

function consoleDir(param: any) {
  console.dir(param, {
    showHidden: false,
    depth: null,
    colors: true,
  });
}
const tableName = "`trainees`";
const selectSql = `
    SELECT * FROM ${tableName}
`;
const countSql = `
    SELECT COUNT(*) AS \`count\` FROM ${tableName}
`;
const insertSql = `
    INSERT INTO ${tableName} (
        \`name\`, 
        \`email\`, 
        \`dob\`, 
        \`address\`
    ) VALUES (
        'Krishanu',
        'krishanu@codecraft.co.in',
        '1990-09-21',
        'Kolkata, West Bengal'
    )
`;

const updateSql = `
    UPDATE ${tableName} SET
        \`name\` = 'Krishanu Dey',
        \`address\` = 'Berhampore, Murshidabd, West Bengal'
    WHERE 
        \`email\` = "krishanu@codecraft.co.in"
`;

const deleteSql = `
    DELETE FROM ${tableName} WHERE \`email\` = "krishanu@codecraft.co.in" AND \`name\` = "Krishanu Dey"
`;

async function runQuery(
  connection: mysql.PoolConnection,
  label: string,
  sql: string
) {
  try {
    console.log(`---${label.toUpperCase()} RESULT---`);
    const [result] = await connection.query(sql);
    consoleDir(result);
    console.log("\n\n\n");
  } catch (err) {
    consoleDir(err);
  }
}

async function main() {
  try {
    const pool = mysql.createPool(process.env.DATABASE_URL!);
    const connection = await pool.getConnection();

    await runQuery(connection, "select", selectSql);
    await runQuery(connection, "count", countSql);

    await runQuery(connection, "insert", insertSql);
    await runQuery(connection, "select", selectSql);
    await runQuery(connection, "count", countSql);

    await runQuery(connection, "update", updateSql);
    await runQuery(connection, "select", selectSql);
    await runQuery(connection, "count", countSql);

    await runQuery(connection, "delete", deleteSql);
    await runQuery(connection, "select", selectSql);
    await runQuery(connection, "count", countSql);

    connection.release();
    pool.end();
  } catch (err) {
    consoleDir(err);
  }
}

main();
