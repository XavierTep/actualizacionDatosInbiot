// db.js
import mysql from 'mysql2/promise';

// const db = mysql.createPool({
//     host: "localhost",          // Dirección del servidor MySQL
//     user: "root",                 // Usuario
//     password: "root",             // Contraseña
//     database: "inbiot",       // Nombre de la base de datos
//     port: 3306, // Puerto del servidor MySQL
//     waitForConnections: true,
//     connectionLimit: 10,      // Número máximo de conexiones simultáneas
//     queueLimit: 0,            // Sin límite de cola
// });

const db = mysql.createPool({
    host: "194.164.173.221",          // Dirección del servidor MySQL
    user: "tracom",                 // Usuario
    password: "123456789",             // Contraseña
    database: "inbiot",       // Nombre de la base de datos
    port: 3306, // Puerto del servidor MySQL
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
