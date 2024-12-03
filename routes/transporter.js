const nodemailer = require('nodemailer');

// Configuración del transportador
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'storeclick700@gmail.com', // Correo electrónico
        pass: 'gwughnkhkrlplbiq', // Contraseña generada por Google
    },
});

// Verificación del transportador
transporter.verify((error, success) => {
    if (error) {
        console.error('Error al configurar el transportador:', error);
    } else {
        console.log('Transportador listo para enviar correos.');
    }
});

module.exports = transporter;
