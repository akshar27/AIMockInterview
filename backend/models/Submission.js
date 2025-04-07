// backend/models/Submission.js
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  code: String,
  language: String,
  result: String,
  feedback: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Submission', SubmissionSchema);
