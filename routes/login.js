const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const { email, contraseña } = req.body;
    if (!email || !contraseña) {
        return res.status(400).json({ error: 'Correo electrónico y contraseña son requeridos.' });
    }
    try {
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const usuario = userResult.rows[0];
        if (usuario && await bcrypt.compare(contraseña, usuario.contraseña)) {
            return res.json({ mensaje: 'Usuario autenticado exitosamente', tipo: 'usuario', usuario });
        }
        const merchantResult = await pool.query('SELECT * FROM comerciantes WHERE email = $1', [email]);
        const comerciante = merchantResult.rows[0];
        if (comerciante && await bcrypt.compare(contraseña, comerciante.contraseña)) {
            return res.json({ mensaje: 'Comerciante autenticado exitosamente', tipo: 'comerciante', comerciante });
        }
        return res.status(404).json({ error: 'Usuario o comerciante no encontrado' });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
