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

module.exports = router;
