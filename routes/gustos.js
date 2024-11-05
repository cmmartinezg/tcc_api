const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); 

// Ruta para obtener los gustos del usuario
router.get('/', async (req, res) => { 
    const usuarioId = req.query.usuarioId;
    
    if (!usuarioId) {
        return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM gustos_usuario WHERE usuario_id = $1',
            [usuarioId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los gustos del usuario:', error);
        res.status(500).json({ error: 'Error al obtener gustos del usuario' });
    }
});

module.exports = router;
