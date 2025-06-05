const mongoose = require('mongoose');

const ApplicationDraftSchema = new mongoose.Schema({
  userEmail: String,
  jobUrl: String,
  qaPairs: [
    {
      question: String,
      answer: String
    }
  ],
  resumePath: String,
  status: {
    type: String,
    enum: ['pending_review', 'submitted'],
    default: 'pending_review'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ApplicationDraft', ApplicationDraftSchema);
