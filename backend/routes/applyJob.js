const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const fetch = require('node-fetch');
const extractQuestionsAndAnswers = require('../services/extractAndAnswer');
const ApplicationDraft = require('../models/ApplicationDraft');

// Setup multer
const upload = multer({
  dest: path.join(__dirname, '../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/auto', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, jobTitle, workAuth } = req.body;
    const resumePath = req.file.path;

    console.log('✅ Form received from user:', { name, email, jobTitle, workAuth });
    console.log('📄 Resume uploaded at:', resumePath);

    // 🔍 STEP 1: Extract text from resume
    const buffer = fs.readFileSync(resumePath);
    const parsed = await pdfParse(buffer);
    const resumeText = parsed.text;

    console.log('📄 Resume content preview (first 300 chars):');
    console.log(resumeText.slice(0, 300));

    // 🧠 STEP 2: Use jobTitle or LLM-extracted keywords for job search term (fallback logic kept)
    const prompt = `Extract 5 most relevant job roles or keywords for job search from the resume below:\n\nResume:\n${resumeText}\n\nOutput a comma-separated list like: Frontend Developer, React, Full Stack, Node.js`;

    const keywordRes = await fetch('http://localhost:5002/api/chatgpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const keywordReply = await keywordRes.json();
    const searchTerms = keywordReply.reply && keywordReply.reply.trim() !== '' ? keywordReply.reply : jobTitle;

    console.log('🔍 Final search terms used:', searchTerms);

    // ✅ STEP 3: Extract Questions & Get Answers from LLM
    const { jobUrl, qaPairs, error } = await extractQuestionsAndAnswers({
      searchTerm: searchTerms,
      resumeText,
      jobTitle,
    });

    if (error) {
      return res.status(400).json({ status: 'error', message: error });
    }

    // ✅ STEP 4: Save to MongoDB
    await ApplicationDraft.create({
      userEmail: email,
      userName: name,
      jobUrl,
      qaPairs,
      resumePath,
      searchTerms,
      jobTitle,
      status: 'pending_review',
      createdAt: new Date(),
    });

    console.log('📝 Draft saved to DB.');

    return res.status(200).json({
      status: 'draft_ready',
      message: 'Answers generated, saved for review.',
      jobUrl,
      qaPairs,
    });
  } catch (err) {
    console.error('❌ Error in /auto:', err.message);
    return res.status(500).json({ status: 'error', message: 'Application flow failed.' });
  }
});

module.exports = router;
