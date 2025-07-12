// netlify/functions/gemini.js

// You might have utility functions for API calls in src/utils/index.js
// Adjust the path as necessary.
const { callGeminiAPI } = require('../../src/utils'); // Assuming a function like this exists

exports.handler = async (event, context) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle OPTIONS preflight requests for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: headers,
        body: '',
      };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: headers,
        body: JSON.stringify({ message: 'Method Not Allowed. Only POST is supported.' }),
      };
    }

    const requestBody = JSON.parse(event.body);
    const prompt = requestBody.prompt; // Assuming the client sends a 'prompt' in the body

    if (!prompt) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ message: 'Prompt is required in the request body.' }),
      };
    }

    // Call your Gemini API utility function
    // Ensure callGeminiAPI handles the actual fetch call and API key securely.
    // Example: const geminiResponse = await callGeminiAPI(prompt, process.env.GEMINI_API_KEY);
    // For now, let's simulate a response.
    const geminiResponse = await callGeminiAPI(prompt); // Your actual API call here

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        message: 'Gemini API call successful',
        response: geminiResponse, // Send the actual response from Gemini
      }),
    };

  } catch (error) {
    console.error('Error in gemini function:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
    };
  }
};
