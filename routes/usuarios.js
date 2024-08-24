const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');
const bcrypt = require('bcrypt');

// Crear un nuevo usuario
router.post('/', async (req, res) => {
    const { nombre, email, contraseña, direccion, telefono } = req.body;

    try {
        // Verificar si el email ya está registrado
        const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (usuarioExistente.rows.length > 0) {
            return res.status(409).json({ message: 'El email ya está en uso. Por favor, utilice otro email.' });
        }

        // Encriptar la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, contraseña, direccion, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, email, hashedPassword, direccion, telefono]
        );

        return res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// Actualizar un usuario por ID
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { nombre, email, direccion, telefono } = req.body;

    try {
        // Verificar si el email ya está en uso por otro usuario
        const emailCheck = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND id != $2', [email, userId]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ message: 'El email ya está en uso. Por favor, utilice otro email.' });
        }

        const result = await pool.query(
            'UPDATE usuarios SET nombre = $1, email = $2, direccion = $3, telefono = $4 WHERE id = $5 RETURNING *',
            [nombre, email, direccion, telefono, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        return res.json(result.rows[0]);

    } catch (err) {
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Eliminar un usuario por ID
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        return res.json({ message: 'Usuario eliminado correctamente.' });

    } catch (err) {
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        return res.json(result.rows[0]);

    } catch (err) {
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;
