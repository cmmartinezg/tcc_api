const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); // Tu archivo de conexión a la base de datos

// Ruta para obtener los productos según los gustos del usuario
router.get('/productos-por-gustos', async (req, res) => {
    const { usuarioId } = req.query;

    if (!usuarioId) {
        return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    try {
        const query = `
            SELECT p.*
            FROM productos p
            JOIN gustos_usuario gu ON gu.categoria = p.categoria
            WHERE gu.id_usuario = $1
        `;
        const result = await pool.query(query, [usuarioId]);

        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error al obtener productos por gustos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

module.exports = router;
