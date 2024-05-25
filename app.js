const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
