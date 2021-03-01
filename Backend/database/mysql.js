var mysql = require('mysql');
const { DB_USERNAME, DB_PASSWORD, DB_NAME, CLOUD_SQL_CONNECTION_NAME, DB_HOST } = require("./constants");

const dbConfig = {
    connectionLimit: 10, // default 10
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME
};
const pool = mysql.createPool(dbConfig);
export const connection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) reject(err);
            console.log("MySQL pool connected: threadId " + connection.threadId);
            const query = (sql, binding) => {
                return new Promise((resolve, reject) => {
                    connection.query(sql, binding, (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    });
                });
            };
            const release = () => {
                return new Promise((resolve, reject) => {
                    if (err) reject(err);
                    console.log("MySQL pool released: threadId " + connection.threadId);
                    resolve(connection.release());
                });
            };
            const commit = () => {
                return new Promise((resolve, reject) => {
                    if (err) reject(err);
                    console.log("MySQL commit succeed");
                    resolve(connection.commit());
                });
            };
            const rollback = () => {
                return new Promise((resolve, reject) => {
                    if (err) reject(err);
                    console.log("MySQL rollback success");
                    resolve(connection.rollback());
                });
            };
            const beginTransaction = () => {
                return new Promise((resolve, reject) => {
                    if (err) reject(err);
                    console.log("MySQL beginTransaction");
                    resolve(connection.beginTransaction());
                });
            };
            resolve({ query, release, commit, rollback, beginTransaction });
        });
    });
};
export const query = (sql, binding) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, binding, (err, result, fields) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

export function getConnection() {
    const options =
    {
        host: "35.193.109.48", //IP address of my Cloud SQL Server
        user: 'root',
        password: 'poonam2802',
        database: DB_NAME
    };
    return mysql.createConnection(options);
}

// Set up a variable to hold our connection pool.
// let pool;

// export async function getPool() {
//     if (pool) {
//         return next();
//     }
//     try {
//         pool = await createPool();
//         next();
//     } catch (err) {
//         console.log(err);
//         return next(err);
//     }
// }