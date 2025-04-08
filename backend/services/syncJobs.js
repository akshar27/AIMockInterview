const scrapeLinkedInJobs = require('../utils/linkedinScraper');
const Job = require('../models/Job');

const syncJobsToDB = async () => {
  try {
    const scrapedJobs = await scrapeLinkedInJobs("Software Engineer", "Remote");

    for (const job of scrapedJobs) {
      const exists = await Job.findOne({ title: job.title, company: job.company });

      if (!exists) {
        const newJob = new Job({
          title: job.title,
          company: job.company,
          description: job.responsibilities,
          difficulty: 'Medium',
          question: `What would you do as a ${job.title}?`,
          language: ["JavaScript", "Python"]
        });
        await newJob.save();
        console.log(`✅ Saved job: ${job.title} at ${job.company}`);
      } else {
        console.log(`🔁 Skipped duplicate: ${job.title} at ${job.company}`);
      }
    }

    console.log("✅ Job sync completed.");
  } catch (err) {
    console.error("❌ Job sync failed:", err.message);
  }
};

module.exports = syncJobsToDB;
