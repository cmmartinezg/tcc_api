const express = require('express');
const pool = require('../conexionDB');
const router = express.Router();

// Obtener todos los elementos de la lista de deseos para un usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query('SELECT * FROM wishlist WHERE id_usuario = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lista de deseos' });
  }
});

// Agregar un producto a la lista de deseos
router.post('/', (req, res) => {
    const { id_usuario, id_producto } = req.body;
    pool.query(
      'INSERT INTO wishlist (id_usuario, id_producto) VALUES ($1, $2)',
      [id_usuario, id_producto],
      (error, results) => {
        if (error) {
          res.status(500).json({ error: 'Error al agregar a la lista de deseos' });
        } else {
          res.status(201).json({ message: 'Producto agregado a la lista de deseos' });
        }
      }
    );
  });
  module.exports = router;
  
// Eliminar un producto de la lista de deseos
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM wishlist WHERE id = $1', [id]);
    res.json({ message: 'Producto eliminado de la lista de deseos' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar de la lista de deseos' });
  }
});

module.exports = router;
