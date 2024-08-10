const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');
const bcrypt = require('bcrypt');

// Crear un nuevo comerciante
router.post('/', async (req, res) => {
    const { nombre, email, contrasena, direccion, telefono, descripcion, enlace_tienda } = req.body;

    try {
        // Encriptar la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        const result = await pool.query(
            'INSERT INTO comerciantes (nombre, email, contrasena, direccion, telefono, descripcion, enlace_tienda) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nombre, email, hashedPassword, direccion, telefono, descripcion, enlace_tienda]
        );

        return res.json(result.rows[0]);

    } catch (err) {
        if (err.code === '23505') { // Violación de la unicidad del email
            return res.status(409).json({ error: "El email ya está registrado." });
        } else {
            return res.status(500).json({ error: err.message });
        }
    }
});

module.exports = router;
