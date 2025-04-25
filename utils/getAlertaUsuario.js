import { executeQuery } from '../conf/db.js';

export async function getAlertaUsuario(sala) {
    try {
        const sql = `
            SELECT * 
            FROM configuracion_alertas
            WHERE sala_id = ?
        `;
        // Ejecuta una consulta de ejemplo (asegúrate de cambiar 'tabla_ejemplo' por tu tabla real)
        const rows = await executeQuery(sql, [sala]);
        return rows;
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
    }
}

export async function getUsuario(id){
    try {
        const sql = `
            SELECT * 
            FROM usuarios
            WHERE id = ?
            limit 1
        `;
        // Ejecuta una consulta de ejemplo (asegúrate de cambiar 'tabla_ejemplo' por tu tabla real)
        const rows = await executeQuery(sql, [id]);
        return rows[0];
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
    }
}