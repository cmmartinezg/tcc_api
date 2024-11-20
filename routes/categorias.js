const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); 

// Ruta para obtener todas las categorías
router.get('/categorias', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias');
        res.json(result.rows); // Devuelve los registros en formato JSON
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});



module.exports = router;
