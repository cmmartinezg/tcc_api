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

// Función para calcular la duración
function getDurationInMilliseconds(start) {
  const NS_PER_SEC = 1e9; // Convertir nanosegundos a segundos
  const NS_TO_MS = 1e6; // Convertir nanosegundos a milisegundos
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
}

const comercianteRouter = require('./routes/comerciante');
const productoRouter = require('./routes/producto');
const clicsProductosRouter = require('./routes/clics_productos');
const usuarioRouter = require('./routes/usuario');
const comprasRouter = require('./routes/compras');

app.use('/api/comerciante', comercianteRouter);
app.use('/api/producto', productoRouter);
app.use('/api/clics_productos', clicsProductosRouter);
app.use('/api/usuario', usuarioRouter);
app.use('/api/compras', comprasRouter);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
