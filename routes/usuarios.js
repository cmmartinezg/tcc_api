// routes/usuario.js
const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, email, contraseña, direccion, telefono } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, contraseña, direccion, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, email, contraseña, direccion, telefono]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Violación de la unicidad del email
      res.status(409).json({ message: 'El email ya está en uso. Por favor, utilice otro email.' });
    } else {
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
});

module.exports = router;
