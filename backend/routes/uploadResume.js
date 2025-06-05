const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const User = require('../models/User');

const router = express.Router();

// Setup multer to temporarily store files in the "uploads" folder
const upload = multer({ dest: 'uploads/' });

router.post('/:userId', upload.single('resume'), async (req, res) => {
  try {
    // Read uploaded PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    // Delete the temp file after reading
    fs.unlinkSync(req.file.path);

    // Save resume text to user's document
    await User.findByIdAndUpdate(req.params.userId, {
      resumeText: pdfData.text
    });

    res.json({ message: '✅ Resume uploaded and processed.' });
  } catch (err) {
    console.error('[Resume Upload Error]', err);
    res.status(500).json({ message: '❌ Failed to process resume.' });
  }
});

module.exports = router;
