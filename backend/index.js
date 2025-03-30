// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const jobRoutes = require('./routes/jobs');
const submissionRoutes = require('./routes/submissions');
const adminRoutes = require('./routes/admin');
const chatGptRoute = require('./routes/chatgpt');

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());

// DB
connectDB();

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatgpt', chatGptRoute);


app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend + MongoDB' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
