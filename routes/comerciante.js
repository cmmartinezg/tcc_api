// routes/comerciantes.js

const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');

// Obtener todos los comerciantes
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM comerciantes');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Crear un nuevo comerciante
router.post('/', async (req, res) => {
    const { nombre, email, contrasena, direccion, telefono, descripcion, enlace_tienda } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO comerciantes (nombre, email, contrasena, direccion, telefono, descripcion, enlace_tienda) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nombre, email, contrasena, direccion, telefono, descripcion, enlace_tienda]
        );
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Código de error PostgreSQL para violación de restricción de unicidad
            res.status(409).json({ message: 'El comerciante ya existe' });
        } else {
            res.status(500).send(err.message);
        }
    }
});

module.exports = router;
