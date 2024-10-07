const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const pdfParse = require('pdf-parse');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const pool = require('../conexionDB');
const router = express.Router();

// Configurar multer para manejar multipart/form-data
const upload = multer();

// Ruta para crear un nuevo producto de forma individual
router.post('/', upload.none(), async (req, res) => {
    const { nombre, descripcion, precio, categoria, foto_url, id_comerciante } = req.body;

    console.log('Datos recibidos en req.body:', req.body);

    // Validar que todos los campos requeridos estén presentes
    if (!nombre || !descripcion || !precio || !categoria || !foto_url || !id_comerciante) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Insertar el producto y obtener su id
        const result = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, categoria, foto_url, id_comerciante) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, descripcion, parseFloat(precio), categoria, foto_url, id_comerciante]
        );

        res.json({ mensaje: 'Producto registrado exitosamente', producto: result.rows[0] });
    } catch (err) {
        console.error('Error al registrar producto:', err);
        res.status(500).send('Error al registrar producto');
    }
});

// Configurar multer para la carga de archivos de productos (CSV, Excel, PDF)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Directorio donde se guardarán los archivos subidos
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Renombrar el archivo para evitar conflictos
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Función para filtrar los tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    // Tipos de archivos permitidos
    const filetypes = /csv|pdf|xls|xlsx/;
    const mimetype = filetypes.test(file.mimetype.toLowerCase());
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Tipo de archivo no soportado!');
    }
};

// Configurar multer para carga de archivos
const uploadArchivo = multer({
    storage: storage,
    fileFilter: fileFilter
});

// Ruta para manejar la carga masiva de productos mediante archivo
router.post('/upload', uploadArchivo.single('archivoProductos'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se envió ningún archivo o el tipo de archivo no es válido.' });
    }

    const archivoPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
        let productos = [];

        if (ext === '.csv') {
            // Procesar archivos CSV
            productos = await procesarCSV(archivoPath);
        } else if (ext === '.xls' || ext === '.xlsx') {
            // Procesar archivos Excel
            productos = await procesarExcel(archivoPath);
        } else if (ext === '.pdf') {
            // Procesar archivos PDF
            productos = await procesarPDF(archivoPath);
        } else {
            return res.status(400).json({ error: 'Tipo de archivo no soportado.' });
        }

        // Añadir id_comerciante a cada producto
        const id_comerciante = req.body.id_comerciante;
        if (!id_comerciante) {
            return res.status(400).json({ error: 'El id_comerciante es obligatorio' });
        }
        productos = productos.map(producto => ({ ...producto, id_comerciante }));

        // Registrar los productos en la base de datos
        await registrarProductos(productos, res);

        // Eliminar el archivo después de procesarlo
        fs.unlinkSync(archivoPath);
    } catch (err) {
        console.error('Error al procesar el archivo:', err);
        res.status(500).send('Error al procesar el archivo');
        if (archivoPath) fs.unlinkSync(archivoPath);
    }
});

// Función para procesar archivos CSV
const procesarCSV = (archivoPath) => {
    return new Promise((resolve, reject) => {
        const productos = [];
        fs.createReadStream(archivoPath)
            .pipe(csvParser())
            .on('data', (row) => {
                // Leer los campos necesarios
                const { nombre, descripcion, precio, categoria, foto_url } = row;
                const precioNumerico = parseFloat(precio);
                productos.push({ nombre, descripcion, precio: precioNumerico, categoria, foto_url });
            })
            .on('end', () => {
                resolve(productos);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

// Función para procesar archivos Excel
const procesarExcel = (archivoPath) => {
    const workbook = xlsx.readFile(archivoPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const productos = xlsx.utils.sheet_to_json(sheet);
    return productos;
};

// Función para procesar archivos PDF
const procesarPDF = async (archivoPath) => {
    const dataBuffer = fs.readFileSync(archivoPath);
    const data = await pdfParse(dataBuffer);
    const productos = parseTextToProductos(data.text);
    return productos;
};

// Función para registrar productos en la base de datos
const registrarProductos = async (productos, res) => {
    try {
        for (const producto of productos) {
            const { nombre, descripcion, precio, categoria, foto_url, id_comerciante } = producto;

            // Validar que los campos requeridos estén presentes
            if (!nombre || !descripcion || !precio || !categoria || !foto_url || !id_comerciante) {
                continue; // O puedes optar por rechazar toda la operación
            }

            // Insertar el producto
            await pool.query(
                'INSERT INTO productos (nombre, descripcion, precio, categoria, foto_url, id_comerciante) VALUES ($1, $2, $3, $4, $5, $6)',
                [nombre, descripcion, parseFloat(precio), categoria, foto_url, id_comerciante]
            );
        }
        res.json({ mensaje: 'Productos registrados exitosamente' });
    } catch (err) {
        console.error('Error al registrar productos:', err);
        res.status(500).send('Error al registrar productos');
    }
};

// Función para convertir texto de PDF a productos
const parseTextToProductos = (text) => {
    const productos = [];
    const lines = text.split('\n');
    let producto = {};

    for (const line of lines) {
        const [key, value] = line.split(':').map(item => item.trim());
        if (key && value) {
            producto[key.toLowerCase()] = value;
        }
        if (key === 'END') {
            // Fin de un producto
            productos.push({ ...producto });
            producto = {};
        }
    }

    return productos;
};

// Obtener todos los productos o filtrar por comerciante
router.get('/', async (req, res) => {
    const { comercianteId } = req.query;
    try {
        let result;
        if (comercianteId) {
            result = await pool.query(
                'SELECT * FROM productos WHERE id_comerciante = $1',
                [comercianteId]
            );
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
router.put('/:id', upload.none(), async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria, foto_url, id_comerciante } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!nombre || !descripcion || !precio || !categoria || !foto_url || !id_comerciante) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const result = await pool.query(
            'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, categoria = $4, foto_url = $5, id_comerciante = $6 WHERE id = $7 RETURNING *',
            [nombre, descripcion, parseFloat(precio), categoria, foto_url, id_comerciante, id]
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

module.exports = router;
