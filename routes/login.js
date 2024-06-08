const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');
const bcrypt = require('bcrypt');

// Ruta de login
router.post('/', async (req, res) => {
    const { email, contraseña } = req.body;

    // Verificar que el correo electrónico y la contraseña no estén vacíos
    if (!email || !contraseña) {
        return res.status(400).json({ error: 'Correo electrónico y contraseña son requeridos.' });
    }

    try {
        // Intentar encontrar al usuario en la tabla de usuarios
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const usuario = userResult.rows[0];

        if (usuario) {
            // Comparar la contraseña
            const match = await bcrypt.compare(contraseña, usuario.contraseña);
            if (match) {
                return res.json({ mensaje: 'Usuario autenticado exitosamente', tipo: 'usuario', usuario });
            } else {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }
        }

        // Intentar encontrar al comerciante en la tabla de comerciantes
        const merchantResult = await pool.query('SELECT * FROM comerciantes WHERE email = $1', [email]);
        const comerciante = merchantResult.rows[0];

        if (comerciante) {
            // Comparar la contraseña
            const match = await bcrypt.compare(contraseña, comerciante.contraseña);
            if (match) {
                return res.json({ mensaje: 'Comerciante autenticado exitosamente', tipo: 'comerciante', comerciante });
            } else {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }
        }

        return res.status(404).json({ error: 'Usuario o comerciante no encontrado' });
    } catch (err) {
        console.error('Login Error:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
