import { executeQuery } from '../conf/db.js';

// Función para convertir el timestamp a formato MySQL usando la zona horaria de Madrid
export function convertTimestampToMadrid(timestamp) {
    const date = new Date(timestamp);
    const options = {
        timeZone: 'Europe/Madrid',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    const formatted = new Intl.DateTimeFormat('en-GB', options).format(date);
    const [datePart, timePart] = formatted.split(', ');
    const [day, month, year] = datePart.split('/');
    return `${year}-${month}-${day} ${timePart}`;
}

export async function guardarRegistro(dispositivo, sensorsData) {
    try {
        // Usamos la medición de "temperature" (si existe) para obtener update_time.
        let updateTime = null;
        if (sensorsData.temperature) {
            // Convertir el timestamp a la zona horaria de Madrid
            updateTime = convertTimestampToMadrid(sensorsData.temperature.updatetime);
        }

        // Preparar la consulta SQL para insertar en la tabla 'registros'
        const sql = `
            INSERT INTO registros (
                dispositivo,
                update_time,
                co2,
                covid19,
                humidity,
                iaq,
                pm10,
                pm25,
                temperature,
                vocs,
                thermal_indicator,
                ventilation_indicator,
                co,
                formaldehyde,
                no2,
                o3,
                pm1,
                pm4
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            update_peticion = NOW()
        `;

        // Los valores se extraen de sensorsData. Si no se dispone de algún sensor, se inserta NULL.
        const values = [
            dispositivo,                                                  // id del dispositivo (clave foránea)
            updateTime,                                                   // update_time formateado a zona Madrid
            sensorsData.co2 ? sensorsData.co2.value : null,               // co2
            sensorsData.covid19 ? sensorsData.covid19.value : null,       // covid19
            sensorsData.humidity ? sensorsData.humidity.value : null,     // humidity
            sensorsData.iaq ? sensorsData.iaq.value : null,               // iaq
            sensorsData.pm10 ? sensorsData.pm10.value : null,             // pm10
            sensorsData.pm25 ? sensorsData.pm25.value : null,             // pm25
            sensorsData.temperature ? sensorsData.temperature.value : null, // temperature
            sensorsData.vocs ? sensorsData.vocs.value : null,             // vocs
            sensorsData.thermalIndicator ? sensorsData.thermalIndicator.value : null, // thermal_indicator
            sensorsData.ventilationIndicator ? sensorsData.ventilationIndicator.value : null, // ventilation_indicator
            sensorsData.co ? sensorsData.co.value : null,                 // co
            sensorsData.formaldehyde ? sensorsData.formaldehyde.value : null, // formaldehyde
            sensorsData.no2 ? sensorsData.no2.value : null,               // no2
            sensorsData.o3 ? sensorsData.o3.value : null,                 // o3
            sensorsData.pm1 ? sensorsData.pm1.value : null,               // pm1
            sensorsData.pm4 ? sensorsData.pm4.value : null                // pm4
        ];

        // Ejecutar la consulta de inserción y obtener el resultado
        const result = await executeQuery(sql, values);
        // console.log('Registro insertado con id:', result.insertId);
        return result.insertId;
    } catch (error) {
        console.error('Error insertando el registro:', error);
    }
}
