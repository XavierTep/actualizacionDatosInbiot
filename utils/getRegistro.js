// getData.js
import axios from 'axios';

export async function getRegistro(id,key) {
  try {
    const response = await axios.get(`https://myinbiotpublicapi.com/last-measurements/${key}/${id}`);
    // console.log('Datos recibidos:', response.data);
    // const response = {"systemData":[{"type":"temperature","_id":0,"unit":"°C","measurements":[{"value":25,"date":1739968738030}]},{"type":"humidity","_id":1,"unit":"%","measurements":[{"value":46.8,"date":1739968738020}]},{"type":"co2","_id":2,"unit":"ppm","measurements":[{"value":923,"date":1739968738020}]},{"type":"vocs","_id":4,"unit":"ppb","measurements":[{"value":1106,"date":1739968738020}]},{"type":"pm10","_id":7,"unit":"µg/m³","measurements":[{"value":4,"date":1739968738020}]},{"type":"pm25","_id":8,"unit":"µg/m³","measurements":[{"value":4,"date":1739968738020}]},{"type":"covid19","_id":17,"unit":"0-100","measurements":[{"value":64,"date":1739968738020}]},{"type":"iaq","_id":18,"unit":"0-100","measurements":[{"value":70,"date":1739968738020}]},{"type":"thermalIndicator","_id":19,"unit":"0-100","measurements":[{"value":100,"date":1739968738020}]},{"type":"ventilationIndicator","_id":20,"unit":"0-100","measurements":[{"value":68,"date":1739968738020}]},{"type":"formaldehyde","_id":3,"unit":"µg/m³","measurements":[{"value":1223.55,"date":1739968738020}]},{"type":"co","_id":9,"unit":"ppm","measurements":[{"value":0.1,"date":1739968738020}]},{"type":"no2","_id":15,"unit":"ppb","measurements":[{"value":0,"date":1739968738020}]},{"type":"o3","_id":10,"unit":"ppb","measurements":[{"value":0,"date":1739968738020}]}]}
   
    console.log('------------------------------RESPONPoSE---------------------------------------------')

    console.log('Datos recibidos:', response);

    console.log('-------------------------------------------------------------------------------------')
  
    return transformAllSensors(response.data);

  } catch (error) {
    console.error('Error al hacer la petición GET:', error);
    return null;
  }
}

// Función que transforma la respuesta para obtener todos los tipos y su value
export function transformAllSensors(apiResponse) {
  const sensors = {};
  
  // Recorremos cada sensor en systemData
  apiResponse.systemData.forEach(sensor => {
    if (sensor.measurements && sensor.measurements.length > 0) {
      // Tomamos la primera medición (si hay más, se puede ajustar la lógica)
      sensors[sensor.type] = {
        value: sensor.measurements[0].value,
        unit: sensor.unit, // Puedes incluir la unidad si lo deseas
        updatetime: sensor.measurements[0].date
      };
    }
  });
  
  return sensors;
}