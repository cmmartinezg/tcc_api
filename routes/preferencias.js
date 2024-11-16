const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');
router.post('/guardar-preferencias', async (req, res) => {
    const { user_id, categories } = req.body;
    console.log('user_id recibido en el servidor:', user_id); 

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



// Obtener preferencias de un usuario
router.get('/obtener-preferencias/:user_id', async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ message: 'Falta el ID de usuario' });
    }

    try {
        const result = await pool.query(
            'SELECT categoria_id FROM gustos_usuario WHERE usuario_id = $1',
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron preferencias para este usuario' });
        }

        const categorias = result.rows.map(row => row.categoria_id);
        res.json({ categorias });
    } catch (error) {
        console.error('Error al obtener preferencias:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


module.exports = router;
