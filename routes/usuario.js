const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).send(err.message);
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, email, contraseña, direccion, telefono } = req.body;

  // Registro para verificar los datos recibidos
  console.log('Datos recibidos para crear un usuario:', { nombre, email, contraseña, direccion, telefono });

  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, contraseña, direccion, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, email, contraseña, direccion, telefono]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear un nuevo usuario:', err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
