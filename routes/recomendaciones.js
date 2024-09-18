// Importar Express y crear un Router
const express = require('express');
const router = express.Router();

// Ejemplo de datos de recomendaciones (puedes reemplazarlos con datos reales o una llamada a una API)
const recomendaciones = [
  { id: 150, nombre: 'Producto 150', calificacion: 3.47 },
  { id: 164, nombre: 'Producto 164', calificacion: 3.39 },
  { id: 156, nombre: 'Producto 156', calificacion: 3.38 },
  { id: 134, nombre: 'Producto 134', calificacion: 3.29 },
  { id: 205, nombre: 'Producto 205', calificacion: 3.29 },
];

// Definir la ruta para obtener recomendaciones
router.get('/', (req, res) => {
  // Aquí puedes incluir lógica para obtener recomendaciones según algún parámetro, como id_comerciante
  res.json(recomendaciones); // Devolver el array de recomendaciones como respuesta JSON
});

// Exportar el router
module.exports = router;
