const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');

// Obtener todas las compras
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM compras');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Crear una nueva compra 
router.post('/', async (req, res) => {
  const { id_usuario, id_producto, cantidad, total } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO compras (id_usuario, id_producto, cantidad, total) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_usuario, id_producto, cantidad, total]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;