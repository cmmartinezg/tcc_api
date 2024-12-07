const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Función para validar formato de email
function validarEmailFormato(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validar si un email ya existe
router.get('/validar-email', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: "Se requiere el email." });
    }

    // Verificar formato
    if (!validarEmailFormato(email)) {
        return res.json({ exists: false });
    }

    try {
        const emailExists = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
        const exists = emailExists.rows.length > 0;
        return res.json({ exists });
    } catch (err) {
        console.error('Error al validar email:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// Crear nuevo usuario
router.post('/', async (req, res) => {
    const { nombre, email, contrasena, direccion, telefono } = req.body;

    try {
        if (!nombre || !email || !contrasena) {
            return res.status(400).json({ message: "Nombre, email y contraseña son obligatorios." });
        }

        if (!validarEmailFormato(email)) {
            return res.status(400).json({ message: "El formato del email no es válido." });
        }

        // Verificar si el email ya está registrado
        const emailExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (emailExists.rows.length > 0) {
            return res.status(409).json({ message: "El email ya está en uso. Por favor, utilice otro email." });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // Insertar el usuario
        const insertQuery = `
            INSERT INTO usuarios (nombre, email, contrasena, direccion, telefono)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const result = await pool.query(insertQuery, [nombre, email, hashedPassword, direccion, telefono]);

        // Generar token de verificación
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationLink = `${process.env.BASE_URL}/api/usuarios/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

        // Guardar el token en la base de datos
        await pool.query('UPDATE usuarios SET verification_token = $1 WHERE email = $2', [verificationToken, email]);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verificación de correo electrónico',
            text: `Hola ${nombre},

¡Bienvenido a Click Store! Nos alegra mucho que te hayas registrado.

Para activar tu cuenta y comenzar a disfrutar de nuestros servicios, por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:

${verificationLink}

Si no fuiste tú quien solicitó esta cuenta, simplemente ignora este mensaje.

¡Gracias por confiar en nosotros!

El equipo de Click Store`
        };

        // Enviar el correo
        try {
            await transporter.sendMail(mailOptions);
            console.log('Correo de verificación enviado a:', email);
        } catch (error) {
            console.error('Error al enviar el correo de verificación:', error);
            return res.status(500).json({ message: "Usuario registrado, pero no se pudo enviar el correo de verificación." });
        }

        return res.json(result.rows[0]);

    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: "El email ya está en uso. Por favor, utilice otro email." });
        } else {
            console.error('Error al crear un nuevo usuario:', err.message);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
});

// Verificar el correo electrónico del usuario
router.get('/verify-email', async (req, res) => {
    const { token, email } = req.query;

    if (!token || !email) {
        return res.status(400).json({ message: "Se requieren el token y el email para verificar." });
    }

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND verification_token = $2', [email, token]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "El token de verificación es inválido o ha expirado." });
        }

        await pool.query('UPDATE usuarios SET verified = true, verification_token = NULL WHERE email = $1', [email]);
        return res.json({ message: "Correo electrónico verificado con éxito." });

    } catch (err) {
        console.error('Error al verificar correo:', err.message);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Obtener todos los usuarios (GET)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre, email, direccion, telefono, verified FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener usuarios:', err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;
