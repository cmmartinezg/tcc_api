const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); // Asegúrate de que esta conexión esté configurada correctamente

// Ruta para obtener todas las categorías
router.get('/categorias', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias'); // Selecciona todos los registros de la tabla 'categorias'
        res.json(result.rows); // Devuelve los registros en formato JSON
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});
// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM categorias WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// **Nueva Ruta: Obtener Nombres de Múltiples Categorías**
router.post('/obtener-nombres', async (req, res) => {
    const { categoriasIds } = req.body;

    if (!categoriasIds || !Array.isArray(categoriasIds)) {
        return res.status(400).json({ message: 'Se requiere un array de IDs de categorías' });
    }

    try {
        const result = await pool.query(
            'SELECT id, nombre FROM categorias WHERE id = ANY($1::int[])',
            [categoriasIds]
        );

        res.json({ categorias: result.rows });
    } catch (error) {
        console.error('Error al obtener nombres de categorías:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


module.exports = router;
