const express = require('express');
const pool = require('../conexionDB');
const KNN = require('ml-knn'); // Importar la biblioteca de KNN
const router = express.Router();

// Ruta de recomendaciones usando KNN
router.get('/recomendaciones_knn/:id', async (req, res) => {
    const productoId = req.params.id;
    
    try {
        const result = await pool.query('SELECT * FROM productos');
        const productos = result.rows;

        if (productos.length === 0) {
            return res.status(404).json({ mensaje: 'No hay productos disponibles' });
        }

        // Buscar el producto actual
        const productoActual = productos.find(p => p.id == productoId);
        if (!productoActual) {
            return res.status(404).json({ mensaje: `El producto con ID ${productoId} no existe` });
        }

        // Preparar los datos para el KNN (por ejemplo, solo usando el precio como característica)
        const X = productos.map(p => [p.precio]);
        const ids = productos.map(p => p.id);
        const knn = new KNN(X);

        // Buscar los 5 vecinos más cercanos basados en el precio
        const nearest = knn.kNearest([productoActual.precio], 5);

        // Obtener los productos recomendados basados en los vecinos cercanos
        const recomendaciones = nearest.map(index => productos[ids.indexOf(ids[index])]);

        console.log(`Recomendaciones generadas para el producto ID ${productoId}:`);
        recomendaciones.forEach(p => console.log(`ID: ${p.id}, Nombre: ${p.nombre}, Precio: ${p.precio}`));

        res.json(recomendaciones);
    } catch (error) {
        console.error('Error al generar recomendaciones:', error);
        res.status(500).json({ error: 'Error al generar recomendaciones' });
    }
});

module.exports = router;
