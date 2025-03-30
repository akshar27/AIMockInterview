// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// POST /api/admin/add-job - Admin adds a new job
router.post('/add-job', async (req, res) => {
  const { title, company, description, difficulty, question, language } = req.body;

  if (!title || !company || !description || !question || !language) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }

  try {
    const newJob = new Job({
      title,
      company,
      description,
      difficulty,
      question,
      language,
    });

    await newJob.save();
    res.status(201).json({ message: '✅ Job added successfully', job: newJob });
  } catch (err) {
    res.status(500).json({ error: '❌ Failed to add job', details: err.message });
  }
});

module.exports = router;
