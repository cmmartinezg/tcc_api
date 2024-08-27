const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// Importar routers
const comerciantesRouter = require('./routes/comerciantes');
const productosRouter = require('./routes/productos');
const clicsProductosRouter = require('./routes/clics_productos');
const usuariosRouter = require('./routes/usuarios');
const comprasRouter = require('./routes/compras');
const loginRouter = require('./routes/login');
const valoracionesRouter = require('./routes/valoraciones');

// Usar routers
app.use('/api/comerciantes', comerciantesRouter);
app.use('/api/productos', productosRouter);
app.use('/api/clics_productos', clicsProductosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/compras', comprasRouter);
app.use('/api/login', loginRouter);
app.use('/api/valoraciones', valoracionesRouter); // Asegúrate de que esta línea esté presente

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
