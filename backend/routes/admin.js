// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const syncJobsToDB = require('../services/syncJobs');

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

// POST /api/admin/sync-jobs
router.post('/sync-jobs', async (req, res) => {
  try {
    await syncJobsToDB(); 
    res.status(200).json({ message: '✅ Jobs synced successfully from LinkedIn.' });
  } catch (err) {
    console.error('❌ Error syncing jobs:', err.message);
    res.status(500).json({ error: 'Failed to sync jobs', details: err.message });
  }
});

module.exports = router;


module.exports = router;
