// backend/services/leetcodeScraper.js
const fetch = require('node-fetch');
const Job = require('../models/Job'); // Mongoose model

const GRAPHQL_URL = 'https://leetcode.com/graphql';
const HEADERS = {
  'Content-Type': 'application/json',
  'Referer': 'https://leetcode.com',
  'User-Agent': 'Mozilla/5.0',
};

async function fetchQuestionList(skip = 0, limit = 50) {
  const query = {
    query: `
      query questionList($skip: Int, $limit: Int) {
        questionList(skip: $skip, limit: $limit) {
          questions {
            title
            titleSlug
            difficulty
            isPaidOnly
          }
          total
        }
      }
    `,
    variables: { skip, limit },
  };

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(query),
  });

  const data = await res.json();
  return data.data.questionList;
}

async function fetchQuestionDetails(titleSlug) {
  const query = {
    query: `
      query questionContent($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          content
          difficulty
          sampleTestCase
          exampleTestcases
        }
      }
    `,
    variables: { titleSlug },
  };

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(query),
  });

  const data = await res.json();
  return data.data.question;
}

async function syncLeetCodeQuestionsToDB(limitCount = 100) {
  console.log('🚀 Starting LeetCode sync...');

  const { total } = await fetchQuestionList(0, 1);
  let count = 0;

  for (let skip = 0; skip < total && count < limitCount; skip += 50) {
    const batch = await fetchQuestionList(skip, 50);

    for (const q of batch.questions) {
      if (q.isPaidOnly || count >= limitCount) continue;

      const alreadyExists = await Job.findOne({ title: q.title });
      if (alreadyExists) continue;

      const details = await fetchQuestionDetails(q.titleSlug);

      const job = new Job({
        title: details.title,
        company: 'LeetCode',
        description: details.content?.replace(/<[^>]+>/g, '').slice(0, 500),
        difficulty: details.difficulty,
        question: details.content?.replace(/<[^>]+>/g, ''),
        language: ['Python', 'JavaScript'], // default assumed
      });

      await job.save();
      console.log(`✅ Saved: ${details.title}`);
      count++;
    }
  }

  console.log(`🎉 Sync completed. Total added: ${count}`);
}

module.exports = syncLeetCodeQuestionsToDB;
