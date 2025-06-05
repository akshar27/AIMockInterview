// routes/drafts.js
const express = require('express');
const router = express.Router();
const ApplicationDraft = require('../models/ApplicationDraft');

router.get('/:email', async (req, res) => {
  try {
    const drafts = await ApplicationDraft.find({ userEmail: req.params.email, status: 'pending_review' });
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

router.post('/:id/submit', async (req, res) => {
  try {
    const { qaPairs } = req.body;
    const draft = await ApplicationDraft.findById(req.params.id);

    if (!draft) return res.status(404).json({ message: 'Draft not found' });

    draft.qaPairs = qaPairs;
    draft.status = 'submitted';
    await draft.save();

    // Trigger Puppeteer apply automation
    const result = await applyToJob({
      jobUrl: draft.jobUrl,
      resumePath: draft.resumePath,
      email: draft.userEmail,
      qaPairs
    });

    return res.status(200).json({ message: 'Application submitted successfully', result });
  } catch (err) {
    console.error('❌ Error submitting application:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
