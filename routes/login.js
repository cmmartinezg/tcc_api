const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        // Buscar comerciante por email
        const merchantResult = await pool.query('SELECT * FROM comerciantes WHERE email = $1', [email]);
        const comerciante = merchantResult.rows[0];

        console.log('Contraseña ingresada:', contraseña);
        console.log('Contraseña hash comerciante:', comerciante ? comerciante.contrasena : 'No comerciante encontrado');

        if (comerciante && await bcrypt.compare(contraseña, comerciante.contrasena)) {
            return res.json({
                mensaje: 'Comerciante autenticado exitosamente',
                tipo: 'comerciante',
                comercianteId: comerciante.id,
                comercianteNombre: comerciante.nombre
            });
        }

        // Buscar usuario por email (si no es comerciante)
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const usuario = userResult.rows[0];

        console.log('Contraseña hash usuario:', usuario ? usuario.contrasena : 'No usuario encontrado');

        if (usuario && await bcrypt.compare(contraseña, usuario.contrasena)) {
            return res.json({
                mensaje: 'Usuario autenticado exitosamente',
                tipo: 'usuario',
                usuarioId: usuario.id,
                usuarioNombre: usuario.nombre
            });
        }

        // Si no se encuentra ni comerciante ni usuario
        return res.status(404).json({ error: 'Usuario o comerciante no encontrado' });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
