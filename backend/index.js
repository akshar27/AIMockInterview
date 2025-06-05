const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./db');
const cron = require('node-cron');
require('dotenv').config();

const jobRoutes = require('./routes/jobs');
const submissionRoutes = require('./routes/submissions');
const adminRoutes = require('./routes/admin');
const chatGptRoute = require('./routes/chatgpt');
const authRoutes = require('./routes/auth');
const applyJobRoute = require('./routes/applyJob');
const draftsRoute = require('./routes/drafts');
const leetcodeRoutes = require('./routes/leetcode');
const gfgRoutes = require('./routes/gfg');
const syncJobsToDB = require('./services/syncJobs');
const authMiddleware = require('./middleware/authMiddleware'); 
const uploadResumeRoutes = require('./routes/uploadResume');

const app = express();
const PORT = process.env.PORT || 5002;

// ✅ Rate Limiting (especially for auth to prevent brute force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// ✅ CORS and JSON Parser
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/chatgpt', chatGptRoute);

// ✅ Protected Routes
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/submissions', authMiddleware, submissionRoutes);

// ✅ Other Feature Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/apply', applyJobRoute);
app.use('/api/drafts', draftsRoute);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/gfg', gfgRoutes);
app.use('/api/profile', require('./routes/profile'));
app.use('/api/jobs-for-user', require('./routes/jobsForUser'));
app.use('/api/resume-upload', uploadResumeRoutes);


// ✅ Cron Job (optional - toggle via .env)
if (process.env.ENABLE_CRON === 'true') {
  cron.schedule('0 2 * * *', async () => {
    console.log("🕑 Running daily LinkedIn job sync...");
    try {
      await syncJobsToDB();
      console.log("✅ Job sync completed.");
    } catch (err) {
      console.error("❌ Cron job failed:", err);
    }
  });
}

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong. Please try again later.' });
});

// ✅ Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
