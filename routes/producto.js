const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, id_comerciante } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, id_comerciante) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, descripcion, precio, id_comerciante]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;