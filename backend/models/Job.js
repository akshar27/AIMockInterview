// backend/models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  description: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  question: String,
  language: [String], // e.g., ["Python", "JavaScript"]
});

module.exports = mongoose.model('Job', JobSchema);
