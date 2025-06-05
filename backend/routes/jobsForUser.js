const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const chatWithLLM = require('../services/chatWithLLM');

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const jobs = await Job.find();

    if (!user.resumeText) return res.json(jobs); // no resume → return all

    const matched = [];

    for (const job of jobs) {
      const prompt = `
Resume:
${user.resumeText}

Job:
Title: ${job.title}
Description: ${job.description}

Rate match 0–100 and explain why.
      `;

      const matchResult = await chatWithLLM(prompt); // call GPT or local LLM
      matched.push({ ...job._doc, match: matchResult });
    }

    res.json(matched);
  } catch (err) {
    console.error('[Jobs For User Error]', err);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

module.exports = router;