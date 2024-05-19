const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./conexionDB');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
const userRoutes = require('./routes/usuario');
const productRoutes = require('./routes/producto');
const orderRoutes = require('./routes/orden_servicio');

// Usar Rutas
app.use('/api/usuarios', userRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/ordenes', orderRoutes);

// Iniciar Servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

module.exports = app;
