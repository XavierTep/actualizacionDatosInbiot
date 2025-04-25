// db.js
import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

// const db = mysql.createPool({
//     host: process.env.DB_HOST || "localhost",          // Dirección del servidor MySQL
//     user: process.env.DB_USER || "root",                 // Usuario
//     password: process.env.DB_PASSWORD || "bk201",             // Contraseña
//     database: process.env.DB_DATABASE || "inbiotlocal",       // Nombre de la base de datos
//     port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306, // Puerto del servidor MySQL
//     waitForConnections: true,
//     connectionLimit: 10,      // Número máximo de conexiones simultáneas
//     queueLimit: 0,            // Sin límite de cola
// });

const db = mysql.createPool({
    host: process.env.DB_HOST || "194.164.173.221",          // Dirección del servidor MySQL
    user: process.env.DB_USER || "tracom",                 // Usuario
    password: process.env.DB_PASSWORD || "123456789",             // Contraseña
    database: process.env.DB_DATABASE || "inbiot",       // Nombre de la base de datos
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306, // Puerto del servidor MySQL
    waitForConnections: true,
    connectionLimit: 10,      // Número máximo de conexiones simultáneas
    queueLimit: 0,            // Sin límite de cola
});

// Función para ejecutar una consulta y liberar la conexión después
export async function executeQuery(query, params) {
    const connection = await db.getConnection();
    try {
        const [rows] = await connection.query(query, params);
        return rows; // Nota: podrías retornar directamente 'rows' si lo prefieres.
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
}

export default db;
