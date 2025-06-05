// backend/routes/chatgpt.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const removeMd = require('remove-markdown');

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
    You are a helpful assistant that generates realistic LeetCode-style coding interview questions.
    
    Given the following job description:
    "${jobDescription}"
    
    And the desired difficulty: ${difficulty}
    
    Generate a LeetCode-style coding interview question that tests knowledge of data structures, algorithms and is relevant to the skills and responsibilities described in the job description.
    
    Use the following example format to guide your output:
    
    ---
    **Example Question:**
    
    **Title**: Merge Intervals
    
    **Problem**: Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.
    
    **Input**: intervals = [[1,3],[2,6],[8,10],[15,18]]
    
    **Output**: [[1,6],[8,10],[15,18]]
    
    **Constraints**:
    - 1 <= intervals.length <= 10⁴
    - intervals[i].length == 2
    - 0 <= start_i <= end_i <= 10⁴
    
    ---
    
    Follow the same structure: 
    - Title
    - Problem description
    - Input
    - Output
    - Constraints
    - At least one example
    
    Make sure the question involves data structures such as arrays, strings, linked lists, trees, graphs, heaps, etc., and fits the job description context.
    `;
    

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates realistic LeetCode-style data structure and algorithm coding interview questions.' },
        { role: 'user', content: basePrompt },
      ],
    });

    const sample = removeMd(gptResponse.choices[0].message.content);
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

    const review = removeMd(gptResponse.choices[0].message.content);
    res.status(200).json({ review });
  } catch (err) {
    console.error('ChatGPT Review Error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to generate code review from ChatGPT' });
  }
});


module.exports = router;
