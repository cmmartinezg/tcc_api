// Archivo: routes/recomendaciones.js
const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); // Asegúrate de que la conexión a la base de datos esté configurada

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
