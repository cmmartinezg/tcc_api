const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');
const bcrypt = require('bcrypt');

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

  try {
    // Encriptar la contraseña antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, contraseña, direccion, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, email, hashedPassword, direccion, telefono]
    );

    return res.json(result.rows[0]);

  } catch (err) {
    if (err.code === '23505') { // Violación de la unicidad del email
      return res.status(409).json({ message: 'El email ya está en uso. Por favor, utilice otro email.' });
    } else {
      console.error('Error al crear un nuevo usuario:', err);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
});

module.exports = router;
