// testOpenAi.js

const { Configuration, OpenAI } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Use environment variable for security
});

const openai = new OpenAI(configuration);

console.log('OpenAI configuration instantiated successfully.');
