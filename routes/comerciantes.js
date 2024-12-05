const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: 'dgugu3tnc',  // Tu Cloud Name
    api_key: '895274873765826',   // Tu API Key
    api_secret: 'lhpCrJaK2aZgPJsX7Q8pLFUoWsA' // Tu API Secret
});

// Configuración de Nodemailer para el envío de correos
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Correo de Gmail desde el archivo .env
        pass: process.env.EMAIL_PASSWORD  // Contraseña de la cuenta de Gmail desde el archivo .env
    }
});

// Crear un nuevo comerciante (INSERT)
router.post('/', async (req, res) => {
    const { nombre, email, contrasena, direccion, telefono, descripcion, enlace_tienda } = req.body;

    try {
        // Verificar si el correo electrónico ya está registrado
        const emailExists = await pool.query('SELECT * FROM comerciantes WHERE email = $1', [email]);
        if (emailExists.rows.length > 0) {
            return res.status(409).json({ error: "El email ya está registrado." });
        }

        // Encriptar la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // Insertar el comerciante en la base de datos
        const result = await pool.query(
            'INSERT INTO comerciantes (nombre, email, contrasena, direccion, telefono, descripcion, enlace_tienda) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nombre, email, hashedPassword, direccion, telefono, descripcion, enlace_tienda]
        );

        // Enviar correo de verificación
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationLink = `${process.env.BASE_URL}/verify-email?token=${verificationToken}&email=${email}`;

        // Guardar el token de verificación en la base de datos
        await pool.query('UPDATE comerciantes SET verification_token = $1 WHERE email = $2', [verificationToken, email]);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verificación de correo electrónico',
            text: `Hola ${nombre},\n\nPor favor verifica tu correo electrónico haciendo clic en el siguiente enlace:\n\n${verificationLink}\n\nGracias.`
        };

        // Enviar el correo
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ error: "No se pudo enviar el correo de verificación." });
            }
            console.log('Correo de verificación enviado: ' + info.response);
        });

        return res.json(result.rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Verificar el correo electrónico del comerciante (Verificación del token)
router.get('/verify-email', async (req, res) => {
    const { token, email } = req.query;

    try {
        const result = await pool.query('SELECT * FROM comerciantes WHERE email = $1 AND verification_token = $2', [email, token]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "El token de verificación es inválido o ha expirado." });
        }

        // Marcar el correo como verificado
        await pool.query('UPDATE comerciantes SET verified = true, verification_token = NULL WHERE email = $1', [email]);

        return res.json({ message: "Correo electrónico verificado con éxito." });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Obtener todos los comerciantes (GET)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre, email, direccion, telefono, descripcion, enlace_tienda FROM comerciantes');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Obtener un comerciante por ID (GET)
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT id, nombre, email, direccion, telefono, descripcion, enlace_tienda FROM comerciantes WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Comerciante no encontrado" });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Actualizar un comerciante (UPDATE)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, email, contrasena, direccion, telefono, descripcion, enlace_tienda } = req.body;

    try {
        let hashedPassword;
        if (contrasena) {
            hashedPassword = await bcrypt.hash(contrasena, 10);
        }

        const result = await pool.query(
            'UPDATE comerciantes SET nombre = $1, email = $2, contrasena = COALESCE($3, contrasena), direccion = $4, telefono = $5, descripcion = $6, enlace_tienda = $7 WHERE id = $8 RETURNING *',
            [nombre, email, hashedPassword || null, direccion, telefono, descripcion, enlace_tienda, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Comerciante no encontrado" });
        }

        return res.json(result.rows[0]);

    } catch (err) {
        if (err.code === '23505') { // Violación de la unicidad del email
            return res.status(409).json({ error: "El email ya está registrado." });
        } else {
            return res.status(500).json({ error: err.message });
        }
    }
});

// Eliminar un comerciante (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM comerciantes WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Comerciante no encontrado" });
        }

        return res.json({ message: "Comerciante eliminado exitosamente" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
