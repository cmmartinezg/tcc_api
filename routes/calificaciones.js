const express = require('express');
const pool = require('../conexionDB');
const router = express.Router();

// Ruta para obtener todas las calificaciones
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM calificaciones');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener las calificaciones:', error);
        res.status(500).json({ error: 'Error al obtener las calificaciones' });
    }
});

// Ruta para insertar una calificación
router.post('/', async (req, res) => {
    const { producto_id, calificacion, comentario } = req.body;

    if (!producto_id || !calificacion || !comentario) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    try {
        const query = 'INSERT INTO calificaciones (producto_id, calificacion, comentario) VALUES ($1, $2, $3)';
        const values = [producto_id, calificacion, comentario];
        await pool.query(query, values);
        res.status(201).json({ message: 'Calificación agregada exitosamente' });
    } catch (error) {
        console.error('Error al insertar la calificación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


module.exports = router;