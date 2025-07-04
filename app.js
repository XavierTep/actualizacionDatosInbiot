import cron from 'node-cron';
import { listadoDispositivo } from './utils/listadoDispositivo.js';
import { getRegistro, transformAllSensors } from './utils/getRegistro.js';
import { guardarRegistro } from './utils/guardarRegistro.js';
import { getUmbrales } from './utils/getUmbrales.js';
import { comprobarUmbral } from './utils/comprobarUmbral.js';
import { getAlertaUsuario, getUsuario } from './utils/getAlertaUsuario.js';
import { guardarAlerta } from './utils/guardarAlerta.js';
import { sendEmailSMS } from './utils/sendEmailSMS.js';
import { guardarRegistroAPI } from './utils/guardarRegistroAPI.js';
import moment from 'moment-timezone';

function buildAlertEmailContent(alerts) {
    // Extraer la fecha de actualización del primer alerta (índice 5) o mostrar mensaje alternativo.
    const updateTime = alerts.length > 0 ? alerts[0][5] : 'Fecha no disponible';

    // Construir el encabezado del correo en HTML.
    let content = `<p>Estimado Usuario,</p>
  <p>Se ha detectado una alerta en el sistema de monitorización de sensores. A continuación se detallan los parámetros que han superado los umbrales establecidos:</p>`;

    // Recorrer el array de alertas y agregar cada mensaje.
    alerts.forEach(alert => {
        // Se asume que el índice 2 contiene el mensaje de la alerta.
        content += `<p>- ${alert[2]}</p>`;
    });

    // Agregar la fecha de actualización y el mensaje de cierre.
    content += `<p>Fecha de actualización: ${updateTime} </p>
  <p>Por favor, revise la sala y proceda a las acciones correctivas pertinentes.</p>
  <p>Saludos cordiales,<br>
  Equipo de Lodepa</p>`;

    return content;
}

function buildAlertSMSContent(asunto, alerts) {
    // Extraer la fecha de actualización del primer alerta (índice 5) o mostrar mensaje alternativo.
    const updateTime = alerts.length > 0 ? alerts[0][5] : 'Fecha no disponible';

    // Iniciar el mensaje con el asunto en mayúsculas y un encabezado informativo.
    let alertMessage = `${asunto.toUpperCase()}:\n` +
        `Parámetros por encima de los umbrales establecidos\n`;

    // Recorrer el array de alertas y agregar cada mensaje.
    alerts.forEach(alert => {
        // Se asume que el índice 2 contiene el mensaje de la alerta.
        alertMessage += `${alert[2]}\n`;
    });

    // Agregar la fecha de actualización al final del mensaje.
    alertMessage += `Fecha: ${updateTime}`;

    return alertMessage;
}
  
  // luego en tu función:
  function fechaMenorA(update_time, numero,peticion) {
    const actual       = moment().tz('Europe/Madrid')
    let actualizacion 
    
    if (peticion) {
      actualizacion = moment.tz(update_time, 'Europe/Madrid')
    } else {
        const madridOffset = moment().tz('Europe/Madrid').format('Z');
        actualizacion = moment(update_time).utcOffset(madridOffset, true);
    }
    // console.log(actual.format('YYYY-MM-DD HH:mm:ss'))
    // console.log(actualizacion.format('YYYY-MM-DD HH:mm:ss'))
    const diferencia   = actual.diff(actualizacion, 'minutes')
    // console.log(diferencia)
    return diferencia < numero
  }

// Cada 10 min (para pruebas, se ejecuta cada minuto: '* * * * *')
cron.schedule('* * * * *', async () => {

    try {
        // Puedes obtener los dispositivos de la BD con listadoDispositivo() o usar un array de ejemplo:
        /**********************************************************************************************************/
        const dispositivos = await listadoDispositivo();
        // console.log(dispositivos)
        // const dispositivos = [
        //     {
        //         id_dispositivo: 5,
        //         n_dispositivo: 'Dip. PRL 1',
        //         referencia: '86f8361b01aadd4839a7a78e1c441978082a130b',
        //         api_key_inbiot: '9cb0d106-fdbf-11ef-b22c-17a9da498099',
        //         id_sala: 5,
        //         n_sala: "PRL 1",
        //         id_hospital: 1,
        //         n_hospital: "Hospital de Toledo"
        //         update_time: 1640998400000,
        //         update_peticion: 1640998400000
        //     }
        // ];

        
        // let num = 1;
        for (const dispositivo of dispositivos) {
            // Se obtiene el último registro de la API Inbiot para el dispositivo
            if (dispositivo.encendido=="N") {
                continue;
            }

            const menor12 = fechaMenorA(dispositivo.update_time,12,false);

            const menor12peticion = fechaMenorA(dispositivo.update_peticion,3,true);

            // console.log(menor12,menor12peticion)

            if (dispositivo.update_time!=null) {
                if (menor12 || menor12peticion) {
                    continue;
                }
            }

            try {

                // console.log("------------------------------ " + num + " ---------------------------------------")
                // console.log("Vamos a buscar el: ", dispositivo.id_dispositivo)
                const registroOriginal = await getRegistro(dispositivo.referencia, dispositivo.api_key_inbiot);
                // console.log("Registro API: ", registro)

                // console.log("---------------------------------------------------------------------")
                // num++;
                const registro = transformAllSensors(registroOriginal);
                /**********************************************************************************************************/
                const newID = await guardarRegistro(dispositivo.id_dispositivo, registro);
                if( newID == null) {
                    continue;
                }
                // const newID = 5527;
                await guardarRegistroAPI(newID, dispositivo.id_dispositivo, registroOriginal);
                // Obtener usuarios para alerta según la sala del dispositivo
                const usuariosAlerta = await getAlertaUsuario(dispositivo.id_sala);
                // console.log("Usuario alerta: " + usuariosAlerta)

                if (usuariosAlerta.length > 0) {
                    const umbrales = await getUmbrales(dispositivo.id_sala);
                    // comprobamos los umbrales y agrupamos las alertas por usuario (clave = usuario_id)
                    const parametroAlertados = await comprobarUmbral(umbrales, registro, usuariosAlerta, newID);

                    // console.log("Parametro alertado: " + parametroAlertados)

                    // Recorremos cada grupo de alertas por usuario (clave = userId)
                    for (const userId in parametroAlertados) {
                        if (Object.hasOwnProperty.call(parametroAlertados, userId)) {
                            const alertasUsuario = parametroAlertados[userId]; // Array de alertas para ese usuario
                            // Insertar las alertas en la base de datos
                            await guardarAlerta(alertasUsuario);

                            // Obtener la información del usuario para enviar el correo
                            const user = await getUsuario(userId);

                            if (user.email) {
                                const asunto = `Alerta en la sala ${dispositivo.n_sala} del ${dispositivo.n_hospital}`;
                                const textoMail = buildAlertEmailContent(alertasUsuario);
                                const textoSMS = buildAlertSMSContent(asunto, alertasUsuario);

                                // Enviar correo con las alertas para ese usuario
                                const respuesta = await sendEmailSMS(user.email, asunto, textoMail, user.telefono, textoSMS);
                                // console.log(respuesta);
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error al obtener el registro de la API:', error);
                continue; // Salta al siguiente dispositivo en caso de error
            }
        }
    } catch (error) {
        console.error('Error al obtener dispositivos:', error);
    }
});