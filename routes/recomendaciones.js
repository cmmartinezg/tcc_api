// Archivo: routes/recomendaciones.js
const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); 

// Endpoint para obtener recomendaciones de productos
router.get('/', async (req, res) => {
  const { comercianteId } = req.query;

  try {
    // Aquí llamarías a tu función para calcular recomendaciones
    const productosRecomendados = await obtenerRecomendaciones(comercianteId); // Implementa esta función según tu lógica
    res.json(productosRecomendados);
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    res.status(500).json({ error: 'Error al obtener recomendaciones' });
  }
});

module.exports = router;
const bcrypt = require('bcrypt');
const pool = require('../conexionDB');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                res.status(200).json({ mensaje: 'Inicio de sesión exitoso' });
            } else {
                res.status(400).json({ mensaje: 'Contraseña incorrecta' });
            }
        } else {
            res.status(400).json({ mensaje: 'Usuario no encontrado' });
        }
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});
