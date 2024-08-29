// Archivo: openaiConfig.js
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config(); // Asegúrate de cargar las variables de entorno

// Configuración de OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Usa tu clave API de OpenAI desde las variables de entorno
});

const openaiClient = new OpenAIApi(configuration);

module.exports = openaiClient;
