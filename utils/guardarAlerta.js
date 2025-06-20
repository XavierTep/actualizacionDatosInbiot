import { executeQuery } from '../conf/db.js';

export async function guardarAlerta(values) {
    try {
        // SQL para insertar la alerta
        const insertSql = `
            INSERT INTO alertas (
                sala_id,
                usuario_id,
                alerta,
                campo,
                valor,
                fecha,
                registro_id,
                solventada
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // SQL para verificar si ya existe una alerta activa para el mismo sensor/campo,
        // asegurando además que registro_id tenga un valor (no sea NULL)
        const checkSql = `
            SELECT id 
            FROM alertas 
            WHERE sala_id = ? 
              AND usuario_id = ? 
              AND campo = ? 
              AND fecha = ?
              AND registro_id IS NOT NULL
              AND solventada = 'N'
            ORDER BY fecha DESC 
            LIMIT 1 
        `;
        
        for (const value of values) {
            // value = [sala_id, usuario_id, alerta, campo, valor, fecha, registro_id, solventada]
            const [
                sala_id,
                usuario_id,
                alerta,
                campo,
                valor,
                fecha,
                registro_id,
                solventada
            ] = value;
        
            // Consulta de verificación
            const resultado = await executeQuery(checkSql, [
                sala_id,
                usuario_id,
                campo,
                fecha
            ]);
        
            if (resultado.length === 0) {
                // Insertar alerta ya que no se encontró duplicado que cumpla con la condición y registro_id no sea nulo
                await executeQuery(insertSql, value);
                // console.log(`Insertada alerta para sala_id: ${sala_id}, usuario_id: ${usuario_id}, campo: ${campo}, fecha: ${fecha}, registro_id: ${registro_id}, solventada: ${solventada}`);
            } else {
                // console.log(`Alerta ya activa para sala_id: ${sala_id}, usuario_id: ${usuario_id}, campo: ${campo}, fecha: ${fecha},registro_id : ${registro_id}, solventada : ${solventada} con registro_id ya asignado. No se inserta duplicado.`);
            }
        }
    } catch (error) {
        console.error('Error insertando alerta:', error);
    }
}
