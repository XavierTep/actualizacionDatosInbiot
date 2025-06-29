import { executeQuery } from '../conf/db.js';

export async function getUmbrales(id_sala) {
    try {
        // Ejecuta una consulta de ejemplo (asegúrate de cambiar 'tabla_ejemplo' por tu tabla real)
        const rows = await executeQuery(`SELECT ua.id_parametro AS rowid,
            u.parametro,
            u.min_good,
            u.max_good,
            ua.min_warning,
            ua.max_warning
            FROM umbrales_alertas ua
            INNER JOIN umbrales u ON ua.id_parametro = u.rowid
            INNER JOIN configuracion_alertas ca ON ua.id_conf_alerta = ca.id
            WHERE ca.sala_id = ? AND ua.estado = TRUE `, [id_sala]);
        return rows;
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
    }
}