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
    if (err.code === '23505') { // Código de error PostgreSQL para violación de restricción de unicidad
      res.status(409).json({ error: 'El email ya está en uso. Por favor, use otro email.' });
    } else {
      console.error('Error al registrar usuario:', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
});


module.exports = router;
