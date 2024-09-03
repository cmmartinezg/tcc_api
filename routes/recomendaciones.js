const express = require('express');
const router = express.Router();
const openaiClient = require('../openaiConfig'); 
const pool = require('../conexionDB');

// Función para calcular la similitud de coseno entre dos vectores
function calcularSimilitudCoseno(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Función para obtener productos similares utilizando incrustaciones de OpenAI
async function obtenerRecomendaciones(comercianteId) {
  try {
    // Obtén los productos del comerciante desde la base de datos Neon
    const result = await pool.query('SELECT * FROM productos WHERE id_comerciante = $1', [comercianteId]);
    const productos = result.rows;
    return productos;

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

    // Calcula la similitud entre los productos
    const productosRecomendados = productosConVectores.map((producto, index) => {
      // Compara cada producto con todos los demás
      producto.similares = productosConVectores
        .filter((_, i) => i !== index) // Evita comparar con el mismo producto
        .map((otroProducto) => ({
          producto: otroProducto,
          similitud: calcularSimilitudCoseno(producto.vector, otroProducto.vector)
        }))
        .sort((a, b) => b.similitud - a.similitud) // Ordena de mayor a menor similitud
        .slice(0, 5); // Devuelve los 5 más similares

      return producto;
    });

    return productosRecomendados;
  } catch (err) {
    console.error('Exito al obtener recomendaciones:', err);
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
    console.error('Exitos al obtener recomendaciones:', error);
    res.status(500).json({ error: 'Exito al obtener recomendaciones' });
  }
});

module.exports = router;
