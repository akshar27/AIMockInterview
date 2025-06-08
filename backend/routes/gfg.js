const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/ai-match', async (req, res) => {
  const { title, description, difficulty } = req.body;

  const prompt = `
You are an AI expert at creating coding interview questions, Generate random data structure and algorithms problem asked in big tech companies. For reference you can use https://www.geeksforgeeks.org/

Given the job:
Title: ${title}
Description: ${description}
Difficulty: ${difficulty}

Generate the following (STRICTLY in plain text):
Title: A concise title
Problem: A detailed DSA problem
Input: Input format
Output: Output format
Explanation: Clear explanation
TestCases: A JSON array ONLY, exactly like this format:

[
  { "input": "2 3", "output": "5" },
  { "input": "4 6", "output": "10" }
]

⚠️ Do not use markdown or add any commentary or explanation. Output must be clean and parsable.
`;

  try {
    const aiRes = await fetch('http://localhost:5002/api/chatgpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await aiRes.json();
    const result = data.sample;

    console.log("📤 GFG Raw AI Response:", result); // 🧠 Debug log

    // ✅ Match JSON test cases array
    const testCaseMatch = result.match(/\[\s*{[\s\S]*?}\s*\]/);
    let testCases = [];

    if (testCaseMatch) {
      try {
        testCases = JSON.parse(testCaseMatch[0]);
      } catch (jsonErr) {
        console.error('❌ Test case JSON parse error:', jsonErr.message);
        return res.status(500).json({
          error: 'Test cases returned by AI are invalid. Please try again or change the job description.'
        });
      }
    } else {
      console.warn('⚠️ No test case array found in AI response.');
    }

    res.json({ result, testCases });

  } catch (err) {
    console.error('❌ GFG Agent Error:', err.message);
    res.status(500).json({ error: 'Failed to generate GFG-style problem' });
  }
});

module.exports = router;
