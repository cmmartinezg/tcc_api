const express = require('express');
const pool = require('../conexionDB');
const router = express.Router();

router.get('/', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'El parámetro de búsqueda es obligatorio' });
    }

    try {
        const result = await pool.query(
            'SELECT id, nombre, descripcion, precio, categoria FROM productos WHERE LOWER(nombre) LIKE LOWER($1)',
            [`%${query}%`]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron productos.' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error al buscar productos:', error);
        res.status(500).json({ error: 'Error al buscar productos en la base de datos' });
    }
});

module.exports = router;
