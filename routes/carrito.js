const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');  // Archivo de conexión a la base de datos

// Ruta para agregar un producto al carrito
router.post('/', async (req, res) => {
    const { id_usuario, id_producto, cantidad, usuario, producto } = req.body;
    try {
        const query = `
            INSERT INTO carrito (id_usuario, id_producto, cantidad, fecha_agregado, usuario, producto)
            VALUES ($1, $2, $3, NOW(), $4, $5)
            RETURNING *;
        `;
        const result = await pool.query(query, [id_usuario, id_producto, cantidad, usuario, producto]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error al agregar el producto al carrito.');
    }
});

// Ruta para obtener los productos del carrito por ID de usuario
router.get('/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const query = 'SELECT * FROM carrito WHERE id_usuario = $1;';
        const result = await pool.query(query, [id_usuario]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error al obtener el carrito.');
    }
});

// Ruta para vaciar el carrito después de la compra
router.delete('/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        await pool.query('DELETE FROM carrito WHERE id_usuario = $1;', [id_usuario]);
        res.status(200).send('Carrito vaciado.');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error al vaciar el carrito.');
    }
});

// Ruta para registrar un pedido en la base de datos
router.post('/pedidos', async (req, res) => {
    const { id_usuario, productos, total } = req.body;
    try {
        const query = `
            INSERT INTO pedidos (id_usuario, productos, total, fecha_pedido)
            VALUES ($1, $2, $3, NOW())
            RETURNING *;
        `;
        const result = await pool.query(query, [id_usuario, JSON.stringify(productos), total]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error al registrar la compra.');
    }
});

module.exports = router;
