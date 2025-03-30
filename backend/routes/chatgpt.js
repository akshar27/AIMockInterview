// backend/routes/chatgpt.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint: Generate sample input/output
router.post('/', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string' });
  }

  try {
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that writes coding samples.' },
        { role: 'user', content: `Generate two sample input/output examples for this coding question:\n\n${prompt}` },
      ],
    });

    const sample = gptResponse.choices[0].message.content;
    res.status(200).json({ sample });
  } catch (err) {
    console.error('ChatGPT Error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to fetch sample from ChatGPT' });
  }
});

// Endpoint: Generate LeetCode-style coding question based on job description and prompt
router.post('/generate_question', async (req, res) => {
  const { jobDescription, difficulty, prompt } = req.body;

  if (!jobDescription || typeof jobDescription !== 'string') {
    return res.status(400).json({ error: 'Job description is required and must be a string' });
  }

  try {
    const basePrompt = `
Generate a ${difficulty} random data structure LeetCode-style coding question that could be asked in a technical interview from leetcode website.
 ${prompt}` ;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates realistic LeetCode-style coding interview questions.' },
        { role: 'user', content: basePrompt },
      ],
    });

    const sample = gptResponse.choices[0].message.content;
    res.status(200).json({ sample });

  } catch (err) {
    console.error('ChatGPT Error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to generate question from ChatGPT' });
  }
});

// Endpoint: Review submitted code and suggest improvements
router.post('/review', async (req, res) => {
  const { code, question, prompt } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required and must be a string' });
  }

  try {
    const reviewPrompt = prompt || 'Review the following code for correctness, efficiency, and suggest improvements:';

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a senior software engineer providing expert-level code reviews and suggestions.' },
        { role: 'user', content: `Question: ${question}\n\n${reviewPrompt}\n\n${code}` },
      ],
    });

    const review = gptResponse.choices[0].message.content;
    res.status(200).json({ review });
  } catch (err) {
    console.error('ChatGPT Review Error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to generate code review from ChatGPT' });
  }
});


module.exports = router;
