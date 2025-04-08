const scrapeLinkedInJobs = require('../utils/linkedinScraper');
const Job = require('../models/Job');

const syncJobsToDB = async () => {
  try {

    const titlesToSearch = [
        "Software Engineer",
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Web Developer",
        "Data Scientist",
        "Machine Learning Engineer",
        "DevOps Engineer",
        "AI Engineer",
        "SRE",
        "iOS Developer",
        "Android Developer",
        "Mobile Developer",
        "Firmware Engineer"
    ];
        
    let allScrapedJobs = [];
    
    for (const title of titlesToSearch) {
        const jobs = await scrapeLinkedInJobs(title, "Remote");
        allScrapedJobs = allScrapedJobs.concat(jobs);
    }

    for (const job of allScrapedJobs) {
      const exists = await Job.findOne({ title: job.title, company: job.company });

      if (!exists) {
        const difficulties = ['Easy', 'Medium', 'Hard'];
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

        const newJob = new Job({
          title: job.title,
          company: job.company,
          description: job.responsibilities || job.jobSummary,
          difficulty: randomDifficulty,
          question: `What would you do as a ${job.title}?`,
          language: job.language
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
