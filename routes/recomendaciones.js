const bcrypt = require('bcrypt');
const pool = require('../conexionDB');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                res.status(200).json({ mensaje: 'Inicio de sesión exitoso' });
            } else {
                res.status(400).json({ mensaje: 'Contraseña incorrecta' });
            }
        } else {
            res.status(400).json({ mensaje: 'Usuario no encontrado' });
        }
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});
