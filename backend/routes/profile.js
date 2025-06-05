const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const User = require('../models/User');
const Apply = require('../models/Apply'); // Make sure this path is correct

// GET /api/profile/:userId
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 🧠 Fetch all job applications by the user
    const applications = await Apply.find({ userId: user._id }).populate('jobId');

    // 💻 Fetch all code submissions by the user
    const submissions = await Submission.find({ userId: user._id }).populate('jobId');

    res.json({
      user,
      applications,
      submissions
    });
  } catch (err) {
    console.error('[Profile Error]', err);
    res.status(500).json({ message: 'Failed to load profile' });
  }
});

module.exports = router;
