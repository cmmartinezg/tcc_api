const express = require('express'); 
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
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
const calificacionesRouter = require('./routes/calificaciones');
const carritoRouter = require('./routes/carrito'); 
const recomendacionesRouter = require('./routes/recomendaciones');
const gustosRouter = require('./routes/gustos');
const categoriasRouter = require('./routes/categorias'); 
const preferenciasRouter = require('./routes/preferencias');

// Usar routers 
app.use('/api/productos', productosRouter);
app.use('/api/clics_productos', clicsProductosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/comerciantes', comerciantesRouter);
app.use('/api/compras', comprasRouter);
app.use('/api/login', loginRouter);
app.use('/api/calificaciones', calificacionesRouter); 
app.use('/api/carrito', carritoRouter); 
app.use('/api/gustos', gustosRouter); 
app.use('/api/recomendaciones', recomendacionesRouter); 
app.use('/api', categoriasRouter);
app.use('/api/preferencias', preferenciasRouter);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
