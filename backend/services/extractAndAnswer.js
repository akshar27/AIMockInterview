// STEP-BY-STEP GUIDE: Scrape LinkedIn Application Form & Fill Answers with LLM

// === 1. Add New File: services/extractAndAnswer.js ===
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

puppeteer.use(StealthPlugin());

async function extractQuestionsAndAnswers({ searchTerm, resumeText, jobTitle }) {
  const cookiesPath = './cookies.json';
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    if (fs.existsSync(cookiesPath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesPath));
      await page.setCookie(...cookies);
    }

    await page.goto('https://www.linkedin.com', { waitUntil: 'networkidle2' });

    if (await page.$('input[name="session_key"]')) {
      console.log('🔐 Waiting for manual login...');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      const cookies = await page.cookies();
      fs.writeFileSync(cookiesPath, JSON.stringify(cookies));
    }

    const query = encodeURIComponent(searchTerm);
    await page.goto(`https://www.linkedin.com/jobs/search/?keywords=${query}`, { waitUntil: 'networkidle2' });

    await page.waitForSelector('a.job-card-list__title');
    const jobLinks = await page.$$eval('a.job-card-list__title', links =>
      links.map(link => link.href).slice(0, 1)
    );

    const jobUrl = jobLinks[0];
    await page.goto(jobUrl, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);

    const easyApplyBtn = await page.$('button.jobs-apply-button');
    if (!easyApplyBtn) return { error: 'No Easy Apply button found' };

    await easyApplyBtn.click();
    await page.waitForTimeout(2000);

    const questions = await page.$$eval('input, textarea, select', els =>
      els.map(el => ({
        label: el.getAttribute('aria-label') || el.name || 'Unknown',
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || ''
      })).filter(q => q.label && q.label !== 'Unknown')
    );

    const prompt = `Given the resume and job title below, generate answers to these questions.\n\nResume:\n${resumeText}\n\nJob Title: ${jobTitle}\n\nQuestions:\n${questions.map((q, i) => `${i + 1}. ${q.label}`).join('\n')}\n\nAnswer format:\n1. Answer\n2. Answer\n`;

    const gptRes = await fetch('http://localhost:5002/api/chatgpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const gptData = await gptRes.json();
    const rawAnswers = gptData.reply?.split('\n').map(a => a.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);

    const qaPairs = questions.map((q, i) => ({
      question: q.label,
      answer: rawAnswers[i] || ''
    }));

    return { jobUrl, qaPairs };
  } catch (err) {
    console.error('❌ Extraction failed:', err);
    return { error: err.message };
  } finally {
    await browser.close();
  }
}

module.exports = extractQuestionsAndAnswers;