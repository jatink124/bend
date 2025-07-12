const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/gemini-analysis', async (req, res) => {
    const { prompt } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Loaded from .env

    if (!GEMINI_API_KEY) {
        console.error('Gemini API key is not configured in environment variables.');
        return res.status(500).json({ error: 'Server configuration error: Gemini API key missing.' });
    }

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required for Gemini analysis.' });
    }

    try {
        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                },
            }
        );

        const geminiContent = geminiResponse.data.candidates[0]?.content?.parts[0]?.text;

        if (geminiContent) {
            res.json(geminiContent);
        } else {
            console.error('Gemini response did not contain expected content:', geminiResponse.data);
            res.status(500).json({ error: 'Gemini response was empty or malformed.' });
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Failed to get Gemini analysis. Please check the prompt or API service status.',
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;