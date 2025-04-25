import { executeQuery } from '../conf/db.js';

export async function getUmbrales() {
    try {
        // Ejecuta una consulta de ejemplo (asegúrate de cambiar 'tabla_ejemplo' por tu tabla real)
        const rows = await executeQuery('SELECT * FROM umbrales', []);
        return rows;
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
    }
}