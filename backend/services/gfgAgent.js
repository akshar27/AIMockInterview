const fetch = require('node-fetch');

async function generateGFGProblem(prompt) {
  const res = await fetch('http://localhost:5002/api/chatgpt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  return data.sample;
}

module.exports = generateGFGProblem;
