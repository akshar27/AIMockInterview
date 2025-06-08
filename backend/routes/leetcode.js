const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/ai-match', async (req, res) => {
  const { title, description, difficulty } = req.body;

  const prompt = `
You are a LeetCode expert who returns STRICTLY valid JSON only, Generate random data structure and algorithms problem asked in big tech companies.

Given:
Title: ${title}
Description: ${description}
Difficulty: ${difficulty}

Respond with EXACTLY this example JSON structure (no markdown, no comments):

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

Output only the JSON. Do not wrap it in markdown or text.
Ensure it is 100% valid for JSON.parse().
`;

  try {
    const chatRes = await fetch('http://localhost:5002/api/chatgpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await chatRes.json();
    console.log("🧠 Raw AI Response:", data);

    // ✅ Defensive check for missing or invalid response
    if (!data || !data.sample || typeof data.sample !== 'string') {
      console.error("❌ Invalid AI response:", data);
      return res.status(500).json({ error: 'AI did not return a valid JSON string.' });
    }

    // ✅ Try extracting the first JSON block using regex
    const jsonMatch = data.sample.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ No JSON block found in sample string");
      return res.status(500).json({ error: 'No valid JSON object found in AI output.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("❌ JSON parse error:", parseErr.message);
      return res.status(500).json({ error: `AI returned malformed JSON: ${parseErr.message}` });
    }

    // ✅ Return clean response
    res.json(parsed);
  } catch (err) {
    console.error('❌ Backend LeetCode AI error:', err.message);
    res.status(500).json({ error: 'Failed to contact chatgpt endpoint or parse response.' });
  }
});

module.exports = router;
