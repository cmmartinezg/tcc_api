const OpenAI = require('openai'); // Importa OpenAI
require('dotenv').config(); // Carga variables de entorno desde .env

const apiKey = process.env.OPENAI_API_KEY; // Asegúrate de que la clave API esté en tu archivo .env

if (!apiKey) {
  console.error('Error: OPENAI_API_KEY no está definida en el archivo .env');
  process.exit(1);
}

let openaiClient;

try {
  // Configuración del cliente OpenAI
  openaiClient = new OpenAI({
    apiKey: apiKey, // Utiliza la API key directamente
  });

  console.log('OpenAI Client configurado correctamente.');
} catch (error) {
  console.error('Error al configurar OpenAI Client:', error);
  process.exit(1);
}

module.exports = openaiClient; // Exporta el cliente para uso en otros módulos
