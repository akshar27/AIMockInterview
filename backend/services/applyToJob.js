const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

async function applyToJob({ jobUrl, resumePath, email, qaPairs }) {
  const cookiesPath = './cookies.json';
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Load cookies if available
    if (fs.existsSync(cookiesPath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesPath));
      await page.setCookie(...cookies);
      console.log('🍪 Cookies loaded.');
    }

    await page.goto('https://www.linkedin.com', { waitUntil: 'networkidle2' });

    // If login page is detected, wait for manual login
    if (await page.$('input[name="session_key"]')) {
      console.log('🔐 Manual login required. Waiting...');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 });
      const cookies = await page.cookies();
      fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
      console.log('✅ Cookies saved after login.');
    } else {
      console.log('✅ Logged in using existing cookies.');
    }

    // Go to job page
    await page.goto(jobUrl, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);

    // Click Easy Apply
    const easyApplyBtn = await page.$('button.jobs-apply-button');
    if (!easyApplyBtn) throw new Error('❌ No Easy Apply button found.');
    await easyApplyBtn.click();
    await page.waitForTimeout(2000);

    // Fill inputs and textareas using qaPairs
    for (const { question, answer } of qaPairs) {
      const lowerQ = question.toLowerCase();

      // Fill inputs
      const inputs = await page.$$('input');
      for (const input of inputs) {
        const label = await page.evaluate(el => el.getAttribute('aria-label') || el.getAttribute('name') || '', input);
        if (label && lowerQ.includes(label.toLowerCase())) {
          await input.click({ clickCount: 3 });
          await input.type(answer);
          break;
        }
      }

      // Fill textareas
      const textareas = await page.$$('textarea');
      for (const area of textareas) {
        const label = await page.evaluate(el => el.getAttribute('aria-label') || '', area);
        if (label && lowerQ.includes(label.toLowerCase())) {
          await area.click({ clickCount: 3 });
          await area.type(answer);
          break;
        }
      }
    }

    // Upload resume
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      const absolutePath = path.resolve(resumePath);
      await fileInput.uploadFile(absolutePath);
      console.log('📄 Resume uploaded.');
    }

    // Submit application
    const submitBtn = await page.$('button[aria-label="Submit application"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      console.log('✅ Application submitted:', jobUrl);
    } else {
      console.log('⚠️ Submit button not found. Application incomplete.');
    }

    return `Applied to job: ${jobUrl}`;
  } catch (err) {
    console.error('❌ Failed to apply:', err.message);
    return 'Failed to apply';
  } finally {
    await browser.close();
  }
}

module.exports = applyToJob;
