const { chromium } = require('playwright');

const scrapeLinkedInJobs = async (keyword = "Software Engineer", location = "Remote") => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

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

  const knownLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Ruby', 'PHP', 'Swift',
    'Kotlin', 'Rust', 'Scala', 'R', 'Perl', 'Shell', 'Bash', 'HTML', 'CSS', 'SQL',
    'NoSQL', 'Dart', 'MATLAB'
  ];

  const extractLanguages = (text) => {
    const found = new Set();
    const lowered = text.toLowerCase();
    for (const lang of knownLanguages) {
      if (lowered.includes(lang.toLowerCase())) {
        found.add(lang);
      }
    }
    return Array.from(found);
  };

  const cleanTextBlock = (text) => {
    return text
      .replace(/\n+/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\n{2,}/g, '\n');
  };

  const extractFlexibleSection = (text, startLabels = [], endLabels = []) => {
    const lowerText = text.toLowerCase();
    let startIndex = -1;
    let matchedStart = '';
    for (const label of startLabels) {
      const index = lowerText.indexOf(label.toLowerCase());
      if (index !== -1) {
        startIndex = index;
        matchedStart = label;
        break;
      }
    }
    if (startIndex === -1) return '';
    const afterStart = text.slice(startIndex + matchedStart.length);
    let endIndex = afterStart.length;
    for (const label of endLabels) {
      const index = afterStart.toLowerCase().indexOf(label.toLowerCase());
      if (index !== -1 && index < endIndex) {
        endIndex = index;
      }
    }
    return afterStart.slice(0, endIndex).trim().replace(/\n{2,}/g, '\n');
  };

  const jobs = [];

  for (const job of jobCards.slice(0, 5)) {
    if (job.link && job.title && job.company) {
      try {
        const jobPage = await browser.newPage();
        await jobPage.goto(job.link, { waitUntil: 'domcontentloaded' });
        await jobPage.waitForTimeout(2000);

        const fullDescription = await jobPage.$eval(
          '.description__text, .show-more-less-html__markup',
          node => node.innerText.trim()
        );
        job.description = fullDescription;

        job.jobSummary = cleanTextBlock(extractFlexibleSection(
          fullDescription,
          ["What You'll Do", 'Overview', 'Job Description Summary', 'Job Summary', 'Introduction'],
          ['Knowledge, Skills', 'Responsibilities', 'Minimum Qualifications']
        ));

        job.responsibilities = cleanTextBlock(extractFlexibleSection(
          fullDescription,
          ['Knowledge, Skills And Abilities', 'Job Responsibilities', 'Roles & Responsibilities', 'Responsibilities', 'Job Description', 'OUR IDEAL CANDIDATE WILL HAVE:', 'Your Role And Responsibilities'],
          ['Minimum Qualifications', 'Basic Qualifications', 'Preferred Qualifications']
        ));

        job.minimumQualifications = cleanTextBlock(extractFlexibleSection(
          fullDescription,
          ['Minimum Qualifications', 'Basic Qualifications', 'Qualifications'],
          ['Preferred Qualifications', 'About', 'Company Info']
        ));

        job.preferredQualifications = cleanTextBlock(extractFlexibleSection(
          fullDescription,
          ['Preferred Qualifications', 'Preferred Skills', 'Desired Skills', 'Other Requirements'],
          ['About', 'Salary', 'Company']
        ));

        const languageSource = [
          fullDescription,
          job.minimumQualifications,
          job.preferredQualifications
        ].join('\n');

        job.language = extractLanguages(languageSource);

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
