import { executeQuery } from '../conf/db.js';
import { convertTimestampToMadrid } from './guardarRegistro.js';

export async function guardarRegistroAPI(registroId,dispositivo,registro) {
    try {
        const json = JSON.stringify(registro);  // Convierte el objeto JSON a una cadena JSON
        // console.log(json);
        const update_time = registro.systemData[0].measurements[0].date;
        const fecha = convertTimestampToMadrid(update_time);
        await executeQuery('INSERT INTO registros_txt (registro_id,dispositivo_id,registrotxt,fecha) VALUES (?,?,?,?)', [registroId, dispositivo, json, fecha]);    
    } catch (error) {
        console.error('Error al guardar el registro en la base de datos:', error);
    }
}