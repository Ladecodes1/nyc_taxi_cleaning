const mysql = require('mysql2/promise');
require('dotenv').config();

let connection = null;

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nyc_taxi',
    port: process.env.DB_PORT || 3306,
};

const initialize = async () => {
    try {
        connection = await mysql.createConnection(config);
        console.log('DB connected');
        return true;
    } catch (error) {
        console.error('DB connection failed:', error.message);
        return false;
    }
};

const getConnection = async () => {
    if (!connection) {
        throw new Error('DB not initialized. Call initialize() first.');
    }
    return connection;
};

const query = async (sql, params = []) => {
    try {
        if (!connection) {
            await initialize();
        }
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
};

const transaction = async (callback) => {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();
        const result = await callback(conn);
        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw error;
    }
};

const close = async () => {
    if (connection) {
        await connection.end();
        console.log('DB connection closed');
        connection = null;
    }
};

const isConnected = () => {
    return connection !== null;
};



module.exports = {
    initialize,
    getConnection,
    query,
    transaction,
    close,
    isConnected
};