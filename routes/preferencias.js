// preferences.js
const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');

// Ruta para guardar preferencias
router.post('/guardar-preferencias', async (req, res) => {
    const { user_id, categories } = req.body;

    if (!user_id || !categories) {
        return res.status(400).json({ message: 'Faltan datos para procesar la solicitud' });
    }

    try {
        for (const category_id of categories) {
            await pool.query(
                'INSERT INTO gustos_usuario (usuario_id, categoria_id) VALUES ($1, $2)',
                [user_id, category_id]
            );
        }
        res.json({ message: 'Preferencias guardadas con éxito' });
    } catch (error) {
        console.error('Error al guardar preferencias:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;
