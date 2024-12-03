const express = require('express');
const crypto = require('crypto');
const pool = require('../conexionDB'); // Asegúrate de que esta ruta es correcta
const transporter = require('./transporter'); // Importa el transporter
const router = express.Router();

// Endpoint para solicitar recuperación de contraseña
router.post('/', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'El correo electrónico es requerido.' });
    }

    try {
        // Verificar si el correo pertenece a un usuario
        const userResult = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        const comercianteResult = await pool.query('SELECT id FROM comerciantes WHERE email = $1', [email]);

        let userId = null;
        let userType = null;

        if (userResult.rows.length > 0) {
            userId = userResult.rows[0].id;
            userType = 'usuario';
        } else if (comercianteResult.rows.length > 0) {
            userId = comercianteResult.rows[0].id;
            userType = 'comerciante';
        } else {
            return res.status(404).json({ message: 'El correo no está registrado.' });
        }

        // Generar un token de restablecimiento y su expiración
        const token = crypto.randomBytes(32).toString('hex');
        const expiration = new Date(Date.now() + 3600000); // 1 hora desde ahora

        // Guardar el token y su expiración en la base de datos
        if (userType === 'usuario') {
            await pool.query(
                'UPDATE usuarios SET reset_token = $1, reset_token_expiration = $2 WHERE id = $3',
                [token, expiration, userId]
            );
        } else if (userType === 'comerciante') {
            await pool.query(
                'UPDATE comerciantes SET reset_token = $1, reset_token_expiration = $2 WHERE id = $3',
                [token, expiration, userId]
            );
        }

        // Crear enlace de restablecimiento
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;

        // Configurar y enviar el correo
        const mailOptions = {
            from: '"Click Store" <storeclick700@gmail.com>',
            to: email,
            subject: 'Restablecimiento de Contraseña - Click Store',
            html: `
                <p>Hola,</p>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace de abajo para continuar:</p>
                <a href="${resetLink}" target="_blank">Restablecer Contraseña</a>
                <p>Este enlace es válido por 1 hora.</p>
                <p>Si no solicitaste este cambio, ignora este correo.</p>
                <p>Saludos,</p>
                <p>El equipo de Click Store</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Correo de recuperación enviado con éxito.' });
    } catch (error) {
        console.error('Error al procesar la solicitud de recuperación:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Endpoint para restablecer contraseña
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token y nueva contraseña son requeridos.' });
    }

    try {
        // Verificar el token en ambas tablas
        const userResult = await pool.query(
            'SELECT id FROM usuarios WHERE reset_token = $1 AND reset_token_expiration > $2',
            [token, new Date()]
        );
        const comercianteResult = await pool.query(
            'SELECT id FROM comerciantes WHERE reset_token = $1 AND reset_token_expiration > $2',
            [token, new Date()]
        );

        let userId = null;
        let userType = null;

        if (userResult.rows.length > 0) {
            userId = userResult.rows[0].id;
            userType = 'usuario';
        } else if (comercianteResult.rows.length > 0) {
            userId = comercianteResult.rows[0].id;
            userType = 'comerciante';
        } else {
            return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
        }

        // Actualizar la contraseña y limpiar el token
        if (userType === 'usuario') {
            await pool.query(
                'UPDATE usuarios SET contrasena = $1, reset_token = NULL, reset_token_expiration = NULL WHERE id = $2',
                [newPassword, userId]
            );
        } else if (userType === 'comerciante') {
            await pool.query(
                'UPDATE comerciantes SET contrasena = $1, reset_token = NULL, reset_token_expiration = NULL WHERE id = $2',
                [newPassword, userId]
            );
        }

        res.json({ message: 'Contraseña restablecida con éxito.' });
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;
