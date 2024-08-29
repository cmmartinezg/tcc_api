// Archivo: routes/recomendaciones.js
const express = require('express');
const router = express.Router();
const openaiClient = require('../openaiConfig'); 
const pool = require('../conexionDB');

// Función para obtener productos similares utilizando incrustaciones de OpenAI
async function obtenerRecomendaciones(comercianteId) {
  try {
    // Obtén los productos del comerciante desde la base de datos Neon
    const result = await pool.query('SELECT * FROM productos WHERE id_comerciante = $1', [comercianteId]);
    const productos = result.rows;

    if (productos.length === 0) {
      return [];
    }

    // Genera las incrustaciones de los productos usando OpenAI
    const productosConVectores = await Promise.all(productos.map(async (producto) => {
      const textoProducto = `${producto.nombre} ${producto.descripcion}`;
      const embeddingResponse = await openaiClient.createEmbedding({
        input: textoProducto,
        model: "text-embedding-ada-002"
      });
      producto.vector = embeddingResponse.data[0].embedding;
      return producto;
    }));

    return productosConVectores;
  } catch (err) {
    console.error('Error al obtener recomendaciones:', err);
    throw err;
  }
}

// Endpoint para obtener recomendaciones de productos
router.get('/', async (req, res) => {
  const { comercianteId } = req.query;

  try {
    const productosRecomendados = await obtenerRecomendaciones(comercianteId);
    res.json(productosRecomendados);
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    res.status(500).json({ error: 'Error al obtener recomendaciones' });
  }
});

module.exports = router;
