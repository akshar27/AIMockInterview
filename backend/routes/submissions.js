// backend/routes/submissions.js
const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// POST a new submission
router.post('/', async (req, res) => {
  const { jobId, userId, code, language, result, feedback } = req.body;

  try {

    const submission = new Submission({ jobId, userId, code, language, result, feedback });
    await submission.save();

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit code' });
  }
});

// GET submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('jobId')
      .populate('userId'); 
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

module.exports = router;
