const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');

// Obtener todos los clics de productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clics_productos');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Crear un nuevo clic de producto
router.post('/', async (req, res) => {
  const { id_producto, id_comerciante } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clics_productos (id_producto, id_comerciante) VALUES ($1, $2) RETURNING *',
      [id_producto, id_comerciante]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
