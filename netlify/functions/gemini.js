// netlify/functions/gemini.js

// --- Utility function for Gemini API call (can be moved to src/utils/index.js) ---
const callGeminiAPI = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY; // Get API key from Netlify environment variables
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  try {
    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error response:', errorData);
      throw new Error(`Gemini API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.warn('Unexpected Gemini API response structure:', result);
      return "No text response from Gemini API.";
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Failed to communicate with Gemini API: ${error.message}`);
  }
};
// --- End of Utility function ---


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

    const geminiResponse = await callGeminiAPI(prompt);

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