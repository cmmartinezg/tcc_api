const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');


// Endpoint para guardar la valoración
router.post('/', async (req, res) => {
    const { userId, productId, rating } = req.body;

    try {
        // Verificar si el usuario existe
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            return res.status(400).send('Usuario no encontrado');
        }

        // Verificar si el producto existe
        const productCheck = await pool.query('SELECT * FROM productos WHERE id = $1', [productId]);
        if (productCheck.rows.length === 0) {
            return res.status(400).send('Producto no encontrado');
        }

        // Guardar la valoración
        const result = await pool.query(
            'INSERT INTO valoraciones (user_id, product_id, rating) VALUES ($1, $2, $3) RETURNING *',
            [userId, productId, rating]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al guardar la valoración');
    }
});

module.exports = router;