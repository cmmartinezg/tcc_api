const express = require('express');
const pool = require('../conexionDB');
const router = express.Router();

// Ruta para obtener todos los elementos del carrito de un usuario
router.get('/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const result = await pool.query('SELECT * FROM carrito WHERE id_usuario = $1', [id_usuario]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para agregar un producto al carrito
router.post('/', (req, res) => {
    const { id_usuario, id_producto } = req.body;
    pool.query(
      'INSERT INTO cart (id_usuario, id_producto) VALUES ($1, $2)',
      [id_usuario, id_producto],
      (error, results) => {
        if (error) {
          res.status(500).json({ error: 'Error al agregar al carrito' });
        } else {
          res.status(201).json({ message: 'Producto agregado al carrito' });
        }
      }
    );
  });
  
  module.exports = router;
// Ruta para eliminar un producto del carrito
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM carrito WHERE id = $1', [id]);
    res.json({ message: 'Producto eliminado del carrito' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;
