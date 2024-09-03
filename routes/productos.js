const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const pool = require('../conexionDB');
const openaiClient = require('../openaiConfig'); 
const router = express.Router();

// Nueva ruta para obtener recomendaciones de productos
router.get('/recomendaciones', async (req, res) => {
  const { comercianteId, nombreProducto } = req.query; // Usar comercianteId o nombre de producto para personalizar recomendaciones

  try {
    console.log('Obteniendo recomendaciones para comerciante ID:', comercianteId);

    // Obtener todos los productos de la base de datos excepto los del comerciante actual
    const productos = await pool.query('SELECT * FROM productos WHERE id_comerciante != $1', [comercianteId]);
    console.log('Productos obtenidos para comparar:', productos.rows.length);

    // Crear embeddings de OpenAI para el producto actual
    const embeddingProducto = await obtenerEmbedding(nombreProducto); 
    if (!embeddingProducto) {
      console.error('Error: No se pudo obtener embedding para el producto:', nombreProducto);
      return res.status(500).json({ error: 'No se pudo obtener embedding para el producto.' });
    }

    // Calcular similitud y recomendar productos
    const recomendaciones = [];

    for (const producto of productos.rows) {
      try {
        const embeddingOtroProducto = await obtenerEmbedding(producto.nombre);
        if (!embeddingOtroProducto) {
          console.warn('Embedding no obtenido para producto:', producto.nombre);
          continue;
        }

        const distancia = calcularDistanciaCoseno(embeddingProducto, embeddingOtroProducto);
        if (distancia < 0.5) { // Ejemplo de umbral de similitud
          recomendaciones.push(producto);
        }
      } catch (error) {
        console.error('Error al calcular similitud para producto:', producto.nombre, error);
      }
    }

    console.log('Recomendaciones generadas:', recomendaciones.length);
    res.json(recomendaciones);
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    res.status(500).json({ error: 'Error al obtener recomendaciones' });
  }
});

// Función para obtener embeddings de OpenAI
async function obtenerEmbedding(texto) {
  try {
    console.log('Obteniendo embedding para:', texto);
    const response = await openaiClient.createEmbedding({
      model: "text-embedding-ada-002",
      input: texto
    });

    if (!response || !response.data || !response.data[0].embedding) {
      console.error('Respuesta de OpenAI no contiene embedding válido para:', texto);
      return null;
    }

    console.log('Embedding obtenido correctamente para:', texto);
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error al obtener embedding:', error);
    return null;
  }
}

// Función para calcular la distancia coseno entre dos embeddings
function calcularDistanciaCoseno(embeddingA, embeddingB) {
  try {
    if (!embeddingA || !embeddingB || embeddingA.length !== embeddingB.length) {
      console.error('Embeddings inválidos para calcular distancia coseno.');
      return 1; // Devuelve la máxima distancia posible
    }

    const dotProduct = embeddingA.reduce((sum, val, i) => sum + val * embeddingB[i], 0);
    const magnitudeA = Math.sqrt(embeddingA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(embeddingB.reduce((sum, val) => sum + val * val, 0));
    const distancia = 1 - (dotProduct / (magnitudeA * magnitudeB)); // Distancia coseno

    console.log('Distancia coseno calculada:', distancia);
    return distancia;
  } catch (error) {
    console.error('Error al calcular la distancia coseno:', error);
    return 1; // Devuelve la máxima distancia posible en caso de error
  }
}


// Configurar multer para la carga de archivos con validación de tipo de archivo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /csv|pdf|doc|docx|xls|xlsx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Tipo de archivo no soportado!');
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).single('archivoProductos');

// Ruta para manejar la carga del archivo
router.post('/upload', upload, async (req, res) => {
    const archivoPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
        let productos = [];

        if (ext === '.csv') {
            // Procesar archivos CSV
            fs.createReadStream(archivoPath)
                .pipe(csvParser())
                .on('data', (row) => {
                    productos.push(row);
                })
                .on('end', async () => {
                    console.log("Productos procesados desde CSV:", productos);
                    await registrarProductos(productos, res);
                    fs.unlinkSync(archivoPath);
                });
        } else if (ext === '.pdf') {
            // Procesar archivos PDF
            const dataBuffer = fs.readFileSync(archivoPath);
            const data = await pdfParse(dataBuffer);
            productos = parseTextToProductos(data.text);
            console.log("Productos procesados desde PDF:", productos);
            await registrarProductos(productos, res);
            fs.unlinkSync(archivoPath);
        } else if (ext === '.doc' || ext === '.docx') {
            // Procesar archivos Word
            const result = await mammoth.extractRawText({ path: archivoPath });
            productos = parseTextToProductos(result.value);
            console.log("Productos procesados desde Word:", productos);
            await registrarProductos(productos, res);
            fs.unlinkSync(archivoPath);
        } else if (ext === '.xls' || ext === '.xlsx') {
            // Procesar archivos Excel
            const workbook = xlsx.readFile(archivoPath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            productos = xlsx.utils.sheet_to_json(sheet);
            console.log("Productos procesados desde Excel:", productos);
            await registrarProductos(productos, res);
            fs.unlinkSync(archivoPath);
        }
    } catch (err) {
        console.error('Error al procesar el archivo:', err);
        res.status(500).send('Error al procesar el archivo');
        fs.unlinkSync(archivoPath);
    }
});

// Función para registrar productos en la base de datos
const registrarProductos = async (productos, res) => {
    try {
        for (const producto of productos) {
            const { nombre, descripcion, precio, id_comerciante, foto_url } = producto;
            await pool.query(
                'INSERT INTO productos (nombre, descripcion, precio, id_comerciante, foto_url) VALUES ($1, $2, $3, $4, $5)',
                [nombre, descripcion, parseFloat(precio), id_comerciante, foto_url]
            );
        }
        res.json({ mensaje: 'Productos registrados exitosamente' });
    } catch (err) {
        console.error('Error al registrar productos:', err);
        res.status(500).send('Error al registrar productos');
    }
};

// Crear un nuevo producto de forma individual
router.post('/', async (req, res) => {
    const { nombre, descripcion, precio, id_comerciante, foto_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, id_comerciante, foto_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, descripcion, parseFloat(precio), id_comerciante, foto_url]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send(err.message);
    }
});

// Obtener todos los productos o filtrar por comerciante
router.get('/', async (req, res) => {
    const { comercianteId } = req.query;
    try {
        let result;
        if (comercianteId) {
            result = await pool.query('SELECT * FROM productos WHERE id_comerciante = $1', [comercianteId]);
        } else {
            result = await pool.query('SELECT * FROM productos');
        }
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Eliminar un producto por ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        res.json({ mensaje: 'Producto eliminado exitosamente', producto: result.rows[0] });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).send(err.message);
    }
});

// Actualizar un producto por ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, id_comerciante, foto_url } = req.body;
    try {
        const result = await pool.query(
            'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, id_comerciante = $4, foto_url = $5 WHERE id = $6 RETURNING *',
            [nombre, descripcion, parseFloat(precio), id_comerciante, foto_url, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        res.json({ mensaje: 'Producto actualizado exitosamente', producto: result.rows[0] });
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).send(err.message);
    }
});

// Función para convertir texto en un array de productos, separado por ';'
const parseTextToProductos = (text) => {
    const productos = [];
    const productosText = text.trim().split(';'); // Divide los productos por ';'

    for (const productoText of productosText) {
        const [nombre, descripcion, precio, foto_url] = productoText.split('\n').map(line => line.trim());

        // Solo agrega productos que tengan todos los campos necesarios
        if (nombre && descripcion && precio && foto_url) {
            productos.push({
                nombre,
                descripcion,
                precio: parseFloat(precio),
                foto_url
            });
        }
    }

    return productos;
};

module.exports = router;
