const { OpenAIApi, Configuration } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiClient = new OpenAIApi(configuration);

module.exports = openaiClient;
