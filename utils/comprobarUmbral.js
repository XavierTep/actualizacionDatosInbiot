import { convertTimestampToMadrid } from './guardarRegistro.js';

function conseguirLaHora(timestamp) {
    const date = new Date(timestamp);
    const hourMadrid = date.toLocaleTimeString('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        hour12: false
    });
    return Number(hourMadrid);
}

function convertirEspanol(parametro) {
    switch (parametro) {
        case "co2":
            return "CO2";
        case "covid19":
            return "COVID-19";
        case "humidity":
            return "Humedad";
        case "iaq":
            return "ICA"; // Índice de Calidad del Aire
        case "pm10":
            return "PM10";
        case "pm25":
            return "PM2.5";
        case "temperature":
            return "Temperatura";
        case "vocs":
            return "VOCs"; // Compuestos Orgánicos Volátiles
        case "thermalIndicator":
            return "Indicador Térmico";
        case "ventilationIndicator":
            return "Indicador de Ventilación";
        case "co":
            return "CO";
        case "formaldehyde":
            return "Formaldehído";
        case "no2":
            return "NO₂";
        case "o3":
            return "Ozono";
        case "pm1":
            return "PM1";
        case "pm4":
            return "PM4";
        default:
            return parametro; // Si no coincide, se retorna el mismo valor
    }
}

export async function comprobarUmbral(umbrales, registro, usuarios, newID) {

    let parametroAlertados = {};

    for (const umbral of umbrales) {
        const sensorData = registro[umbral.parametro];
        if (sensorData) {
            // Ajustar el valor para ciertos parámetros dividiendo por 1000
            let sensorValue = sensorData.value;
            let unit = sensorData.unit;
            if (["formaldehyde", "no2", "o3","vocs"].includes(umbral.parametro)) {
                sensorValue = sensorValue / 1000;
                sensorValue = parseFloat(sensorValue.toFixed(3));
                unit = 'ppm';
            }

            const parametro = umbral.parametro;
            const min_good = parseFloat(umbral.min_good);
            const max_good = parseFloat(umbral.max_good);
            const min_warning = parseFloat(umbral.min_warning);
            const max_warning = parseFloat(umbral.max_warning);

            if (sensorValue < min_good || sensorValue > max_good) {
                if (sensorValue < min_warning || sensorValue > max_warning) {
                    const alerta = `${convertirEspanol(parametro)}: ${sensorValue} ${unit}.`;
                    const fecha = convertTimestampToMadrid(sensorData.updatetime);
                    const hora = conseguirLaHora(sensorData.updatetime);
                    for (const usuario of usuarios) {
                        // Asegurarse de que usuario.hora_min y usuario.hora_max sean números
                        const hora_min = Number(usuario.hora_min);
                        const hora_max = Number(usuario.hora_max);

                        if (hora >= hora_min || hora <= hora_max) {
                            const values = [
                                usuario.sala_id,
                                usuario.usuario_id,
                                alerta,
                                parametro,
                                sensorValue,
                                fecha,
                                newID,
                                'N'
                            ];
                            // Si aún no existe un array para este usuario, lo inicializamos
                            if (!parametroAlertados[usuario.usuario_id]) {
                                parametroAlertados[usuario.usuario_id] = [];
                            }
                            parametroAlertados[usuario.usuario_id].push(values);
                        }
                    }
                }
            }
        }
    }
    return parametroAlertados;
}