// calificaciones.js
const express = require('express');
const router = express.Router();
const pool = require('./conexionDB'); 

// Ruta para guardar la calificación
router.post('/api/calificaciones', async (req, res) => {
    const { usuario_id, producto_id, calificacion, comentario, fecha } = req.body;

    try {
        const query = `
            INSERT INTO calificaciones (usuario_id, producto_id, calificacion, comentario, fecha)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [usuario_id, producto_id, calificacion, comentario, fecha];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]); 
    } catch (error) {
        console.error('Error al guardar la calificación:', error);
        res.status(500).json({ message: 'Error al guardar la calificación en la base de datos' });
    }
});

module.exports = router;
