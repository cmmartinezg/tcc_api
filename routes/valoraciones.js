const express = require('express');
const router = express.Router(); // Define router
const pool = require('../conexionDB');

// Endpoint para guardar la valoración
router.post('/', async (req, res) => {
    const { userId, itemId, rating } = req.body;

    try {
        // Verificar si el usuario existe
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        // Verificar si el producto existe
        const productCheck = await pool.query('SELECT * FROM productos WHERE id = $1', [itemId]);
        if (productCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Producto no encontrado' });
        }

        // Guardar la valoración
        const result = await pool.query(
            'INSERT INTO valoraciones (user_id, item_id, rating) VALUES ($1, $2, $3) RETURNING *',
            [userId, itemId, rating]
        );

        res.json({ message: 'Valoración guardada con éxito', valoracion: result.rows[0] });
    } catch (error) {
        console.error('Error al guardar la valoración:', error);
        res.status(500).json({ error: 'Error al guardar la valoración' });
    }
});

module.exports = router; 
