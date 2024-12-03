const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors({
    origin: ['http://127.0.0.1:5501', 'http://localhost:5500'], // Orígenes permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
}));
require('dotenv').config();

// Middleware para parsear JSON
app.use(express.json());

// Middleware de logging personalizado
app.use((req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const durationInMilliseconds = getDurationInMilliseconds(start);
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationInMilliseconds.toLocaleString()} ms`);
    });
    next();
});

function getDurationInMilliseconds(start) {
    const NS_PER_SEC = 1e9;
    const NS_TO_MS = 1e6;
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
}

// Importar routers
const productosRouter = require('./routes/productos');
const clicsProductosRouter = require('./routes/clics_productos');
const usuariosRouter = require('./routes/usuarios');
const comerciantesRouter = require('./routes/comerciantes');
const comprasRouter = require('./routes/compras');
const loginRouter = require('./routes/login');
const carritoRouter = require('./routes/carrito');
const recomendacionesRouter = require('./routes/recomendaciones');
const gustosRouter = require('./routes/gustos');
const categoriasRouter = require('./routes/categorias');
const preferenciasRouter = require('./routes/preferencias');
const calificacionesRouter = require('./routes/calificaciones');
const buscarRouter = require('./routes/buscar');
const recuperarContrasenaRouter = require('./routes/recuperar_contrasena');

// Usar routers
app.use(express.static('public'));
app.use('/api/productos', productosRouter);
app.use('/api/clics_productos', clicsProductosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/comerciantes', comerciantesRouter);
app.use('/api/compras', comprasRouter);
app.use('/api/login', loginRouter);
app.use('/api/carrito', carritoRouter);
app.use('/api/gustos', gustosRouter);
app.use('/api/recomendaciones', recomendacionesRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/preferencias', preferenciasRouter);
app.use('/api/calificaciones', calificacionesRouter);
app.use('/api/buscar', buscarRouter);
app.use('/api/recuperar_contrasena', recuperarContrasenaRouter);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicializar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
