// backend/routes/gfg.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/ai-match', async (req, res) => {
  const { title, description, difficulty } = req.body;

  const prompt = `
You are an AI expert at creating coding interview questions.
Given the job title: "${title}"
Difficulty: "${difficulty}"
And the description: "${description}"

Generate the following:
Title: A concise title
Problem: A detailed DSA problem
Input: Input format
Output: Output format
Explanation: Clear explanation
TestCases: JSON array like:
[
  { "input": "2 3", "output": "5" },
  { "input": "4 6", "output": "10" },
  { "input": "7 8", "output": "15" }
]
Only return the complete response as plain text. Do not include any commentary or markdown formatting.
  `;

  try {
    const aiRes = await fetch('http://localhost:5002/api/chatgpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await aiRes.json();
    const result = data.sample;

    // Extract the JSON array of test cases from the response
    const testCaseMatch = result.match(/\[(.*?)\]/s);
    const testCases = testCaseMatch ? JSON.parse(`[${testCaseMatch[1]}]`) : [];

    res.json({ result, testCases });
  } catch (err) {
    console.error('❌ GFG Agent Error:', err.message);
    res.status(500).json({ error: 'Failed to generate GFG-style problem' });
  }
});

module.exports = router;