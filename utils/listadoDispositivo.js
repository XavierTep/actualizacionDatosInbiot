import { executeQuery } from '../conf/db.js';

export async function listadoDispositivo() {
    try {
        // Ejecuta una consulta que une las tablas: dispositivos, salas y hospitales.
        const rows = await executeQuery(`
           SELECT 
                d.id AS id_dispositivo, 
                d.n_dispositivo, 
                d.referencia, 
                d.api_key_inbiot, 
                d.encendido,
                s.id AS id_sala, 
                s.n_sala, 
                h.id AS id_hospital, 
                h.hospital AS n_hospital,
                r.update_time,
                r.update_peticion
            FROM dispositivos d
            JOIN salas s ON d.sala = s.id
            JOIN hospitales h ON s.hospital = h.id
            LEFT JOIN registros r 
            ON r.id = (
                SELECT r2.id
                FROM registros r2
                WHERE r2.dispositivo = d.id
                ORDER BY r2.update_time DESC
                LIMIT 1
            )
        `, []);
        return rows;
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
    }
}
