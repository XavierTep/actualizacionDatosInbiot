// sendEmailSMS.js
import axios from 'axios';

export async function sendEmailSMS(email, asuntoEmail, textoMail, tlf, textoSMS) {
  try {
    const response = await axios.get('https://hook.eu1.make.com/75rw2gmuxsloq4kcq6wm1cmduco86qp7/', {
      params: { email, asuntoEmail, textoMail, tlf, textoSMS }
    });
    return response.data;
  } catch (error) {
    console.error('Error al hacer la petición GET:', error);
  }
}
