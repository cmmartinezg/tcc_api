const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM producto');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO producto (nombre, descripcion, precio) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
