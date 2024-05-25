const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');

// Obtener todos los comerciante
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comerciantes');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Crear un nuevo comerciante
router.post('/', async (req, res) => {
  const { nombre, email, contraseña, direccion, telefono, descripcion, enlace_tienda } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO comerciantes (nombre, email, contraseña, direccion, telefono, descripcion, enlace_tienda) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nombre, email, contraseña, direccion, telefono, descripcion, enlace_tienda]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
