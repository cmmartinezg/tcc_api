const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');
const bcrypt = require('bcrypt');

// Crear un nuevo comerciante (INSERT)
router.post('/', async (req, res) => {
    const { nombre, email, contrasena, direccion, telefono, descripcion, enlace_tienda } = req.body;

    try {
        // Encriptar la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        const result = await pool.query(
            'INSERT INTO comerciantes (nombre, email, contrasena, direccion, telefono, descripcion, enlace_tienda) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nombre, email, hashedPassword, direccion, telefono, descripcion, enlace_tienda]
        );

        return res.json(result.rows[0]);

    } catch (err) {
        if (err.code === '23505') { // Violación de la unicidad del email
            return res.status(409).json({ error: "El email ya está registrado." });
        } else {
            return res.status(500).json({ error: err.message });
        }
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
