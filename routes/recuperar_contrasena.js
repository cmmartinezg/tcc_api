const express = require('express');
const crypto = require('crypto');
const pool = require('../conexionDB'); // Asegúrate de que esta ruta es correcta
const transporter = require('./transporter'); // Importa el transporter
const bcrypt = require('bcryptjs'); // Agregado para encriptar la nueva contraseña
const router = express.Router();

// Endpoint para solicitar recuperación de contraseña
router.post('/', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'El correo electrónico es requerido.' });
    }

    try {
        // Verificar si el correo pertenece a un usuario o comerciante
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
        const query = userType === 'usuario' ?
            'UPDATE usuarios SET reset_token = $1, reset_token_expiration = $2 WHERE id = $3' :
            'UPDATE comerciantes SET reset_token = $1, reset_token_expiration = $2 WHERE id = $3';
        
        await pool.query(query, [token, expiration, userId]);

        // Crear enlace de restablecimiento
        const resetLink = `http://localhost:4000/reset-password?token=${token}`;

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

// Endpoint para manejar la solicitud GET con el token
router.get('/reset-password', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'El token es requerido.' });
    }

    try {
        // Verificar si el token existe y no ha expirado
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

        // Aquí puedes redirigir a una página en tu frontend para cambiar la contraseña
        res.json({ message: 'Token válido. Ahora puedes cambiar tu contraseña.' });

    } catch (error) {
        console.error('Error al verificar el token:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Endpoint para restablecer contraseña
router.get('/reset-password', async (req, res) => {
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

        // Encriptar la nueva contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña y limpiar el token
        const query = userType === 'usuario' ?
            'UPDATE usuarios SET contrasena = $1, reset_token = NULL, reset_token_expiration = NULL WHERE id = $2' :
            'UPDATE comerciantes SET contrasena = $1, reset_token = NULL, reset_token_expiration = NULL WHERE id = $2';
        
        await pool.query(query, [hashedPassword, userId]);

        res.json({ message: 'Contraseña restablecida con éxito.' });
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;
