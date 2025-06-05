// backend/routes/leetcode.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/ai-match', async (req, res) => {
  const { title, description, difficulty } = req.body;

  const prompt = `
You are a career coach AI assistant.

Given the job:
Title: ${title}
Description: ${description}
Difficulty: ${difficulty}

Suggest ONE LeetCode-style problem in this exact JSON format (no extra comments or words):

{
  "title": "Longest Substring Without Repeating Characters",
  "problem": "Given a string s, find the length of the longest substring without repeating characters.",
  "input": "s = 'abcabcbb'",
  "output": "3",
  "explanation": "The answer is 'abc', with length 3.",
  "testCases": [
    { "input": "abcabcbb", "output": "3" },
    { "input": "bbbbb", "output": "1" }
  ]
}

Strictly follow JSON formatting rules. No markdown or explanations.
`;

  try {
    const chatRes = await fetch('http://localhost:5002/api/chatgpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await chatRes.json();

    const match = data.sample.match(/\{[\s\S]*?\}/);
    const parsed = match ? JSON.parse(match[0]) : null;

    if (!parsed) throw new Error('AI returned invalid JSON');

    res.json(parsed);
  } catch (err) {
    console.error('❌ LeetCode AI error:', err.message);
    res.status(500).json({ error: 'Failed to get LeetCode problem' });
  }
});

module.exports = router;
