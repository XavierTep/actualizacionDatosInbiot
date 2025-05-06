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
    s.id AS id_sala, 
    s.n_sala, 
    h.id AS id_hospital, 
    h.hospital AS n_hospital 
FROM dispositivos d
JOIN salas s ON d.sala = s.id
JOIN hospitales h ON s.hospital = h.id;
        `, []);
        return rows;
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
    }
}
