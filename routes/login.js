const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const { email, contrasena } = req.body;

    try {
        // Buscar comerciante por email
        const merchantResult = await pool.query('SELECT * FROM comerciantes WHERE email = $1', [email]);
        const comerciante = merchantResult.rows[0];

        console.log('Contrasena ingresada:', contrasena);
        console.log('Contrasena hash comerciante:', comerciante ? comerciante.contrasena : 'No comerciante encontrado');

        if (comerciante) {
            if (comerciante.contrasena) {
                const isMatch = await bcrypt.compare(contrasena, comerciante.contrasena);
                if (isMatch) {
                    return res.json({
                        mensaje: 'Comerciante autenticado exitosamente',
                        tipo: 'comerciante', // Tipo de usuario: Comerciante
                        Id: comerciante.id,
                        nombre: comerciante.nombre
                    });
                } else {
                    return res.status(401).json({ error: 'Contraseña incorrecta para comerciante' });
                }
            } else {
                return res.status(500).json({ error: 'Contraseña del comerciante no encontrada' });
            }
        }

        // Buscar usuario por email (si no es comerciante)
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const usuario = userResult.rows[0];

        console.log('Contrasena hash usuario:', usuario ? usuario.contrasena : 'No usuario encontrado');

        if (usuario) {
            if (usuario.contrasena) {
                const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
                if (isMatch) {
                    return res.json({
                        mensaje: 'Usuario autenticado exitosamente',
                        tipo: 'usuario', // Tipo de usuario: Usuario
                        Id: usuario.id,
                        nombre: usuario.nombre
                    });
                } else {
                    return res.status(401).json({ error: 'Contraseña incorrecta para usuario' });
                }
            } else {
                return res.status(500).json({ error: 'Contraseña del usuario no encontrada' });
            }
        }

        // Si no se encuentra ni comerciante ni usuario
        return res.status(404).json({ error: 'Usuario o comerciante no encontrado' });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
