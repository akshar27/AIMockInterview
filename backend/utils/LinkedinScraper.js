const { chromium } = require('playwright');

const scrapeLinkedInJobs = async (keyword = "Software Engineer Intern", location = "Remote") => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // ✅ Filter: jobs posted in last 24 hours using f_TPR=r86400
  const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&f_TPR=r86400`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(1500);
  }

  const jobCards = await page.$$eval('.jobs-search__results-list li', nodes =>
    nodes.map(node => ({
      title: node.querySelector('h3')?.innerText.trim(),
      company: node.querySelector('h4')?.innerText.trim(),
      location: node.querySelector('.job-search-card__location')?.innerText.trim(),
      link: node.querySelector('a')?.href
    }))
  );

  const jobs = [];

  for (const job of jobCards.slice(0, 10)) { // limit to first 10 for speed
    if (job.link && job.title && job.company) {
      try {
        const jobPage = await browser.newPage();
        await jobPage.goto(job.link, { waitUntil: 'domcontentloaded' });
        await jobPage.waitForTimeout(2000);

        const paragraphs = await jobPage.$$eval('#job-details p[dir="ltr"]', nodes =>
          nodes.map(p => p.innerText.trim()).filter(Boolean)
        );

        const fullDescription = paragraphs.join('\n\n');
        job.description = fullDescription;

        const findSection = (label) => {
          const regex = new RegExp(`${label}[^:]*:\\s*([^\\n]+(?:\\n[^\\n]+)*)`, 'i');
          const match = fullDescription.match(regex);
          return match ? match[1].trim() : '';
        };

        job.minimumQualifications = findSection('minimum qualifications');
        job.responsibilities = findSection('responsibilities');

        jobs.push(job);
        await jobPage.close();
      } catch (err) {
        console.error(`❌ Failed to scrape ${job.title} at ${job.company}:`, err.message);
      }
    }
  }

  await browser.close();
  return jobs;
};

module.exports = scrapeLinkedInJobs;
