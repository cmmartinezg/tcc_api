const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

//if (!process.env.OPENAI_API_KEY) {
 //console.error('Error: OPENAI_API_KEY no está definida en el archivo .env');
 // process.exit(1); // Detiene la ejecución si la clave no está definida
//}

let openaiClient = null;

try {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openaiClient = new OpenAIApi(configuration);
  console.log('OpenAI Client configurado correctamente.');
} catch (error) {
  console.error('Error al configurar OpenAI Client:', error);
}

module.exports = openaiClient;
