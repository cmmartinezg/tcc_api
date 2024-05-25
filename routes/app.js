const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const comerciantesRouter = require('./routes/comerciantes');
const productosRouter = require('./routes/productos');
const clicsProductosRouter = require('./routes/clics_productos');
const usuariosRouter = require('./routes/usuarios');
const comprasRouter = require('./routes/compras');

app.use('/api/comerciantes', comerciantesRouter);
app.use('/api/productos', productosRouter);
app.use('/api/clics_productos', clicsProductosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/compras', comprasRouter);

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
