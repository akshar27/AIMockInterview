// backend/routes/submissions.js
const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// POST a new submission
router.post('/', async (req, res) => {
  const { jobId, code, language } = req.body;

  try {
    // Here you could call Judge0 API for code execution and feedback generation
    const result = 'Executed Successfully'; // Stub
    const feedback = 'Code is clean and efficient'; // Stub

    const submission = new Submission({ jobId, code, language, result, feedback });
    await submission.save();

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit code' });
  }
});

// GET submissions (optional)
router.get('/', async (req, res) => {
  try {
    const submissions = await Submission.find().populate('jobId');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

module.exports = router;
