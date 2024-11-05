const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); 

// Ruta para obtener productos personalizados basados en gustos del usuario
router.get('/recomendaciones_personalizadas_por_gustos', async (req, res) => {
    const usuarioId = req.query.usuarioId;

    if (!usuarioId) {
        return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    try {
        // Obtener categorías de interés del usuario
        const gustosResult = await pool.query(
            `SELECT c.nombre AS categoria_nombre 
             FROM gustos_usuario g 
             INNER JOIN categorias c ON g.categoria_id = c.id 
             WHERE g.usuario_id = $1`, 
            [usuarioId]
        );

        console.log("Categorías de interés:", gustosResult.rows); // Log para verificar

        if (gustosResult.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron gustos para este usuario' });
        }

        // Crear un array de nombres de categorías
        const categorias = gustosResult.rows.map(row => row.categoria_nombre.toLowerCase());

        // Obtener productos que pertenecen a las categorías de interés (ignorando mayúsculas/minúsculas)
        const productosResult = await pool.query(
            'SELECT * FROM productos WHERE LOWER(categoria) = ANY($1::text[])',
            [categorias]
        );

        console.log("Productos recomendados:", productosResult.rows); // Log para verificar

        res.json(productosResult.rows);
    } catch (error) {
        console.error('Error al obtener recomendaciones personalizadas por gustos:', error);
        res.status(500).json({ error: 'Error en el servidor al obtener recomendaciones' });
    }
});

module.exports = router;
