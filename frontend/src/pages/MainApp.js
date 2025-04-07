import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

export default function MainApp() {
  const [showEditor, setShowEditor] = useState(false);
  const [code, setCode] = useState('// Write your solution here');
  const [output, setOutput] = useState('');
  const [review, setReview] = useState('');
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(71); // Python 3 default
  const [jobs, setJobs] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/jobs');
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  const allLanguage = async () => {
    try {
      const response = await fetch('https://judge0-ce.p.rapidapi.com/languages', {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '1953ed96cemsh8936373af3efcccp1d398ejsnfbcdd576ead7',
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
      });

      const data = await response.json();
      setLanguages(data);
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const runCode = async () => {
    try {
      // Step 1: Run code using Judge0
      const response = await fetch(
        'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'X-RapidAPI-Key': '1953ed96cemsh8936373af3efcccp1d398ejsnfbcdd576ead7'
          },
          body: JSON.stringify({
            source_code: code,
            language_id: selectedLanguage,
            stdin: ''
          })
        }
      );

      const result = await response.json();
      setOutput(result.stdout || result.stderr || 'No output');

      // Step 2: Request AI code review
      const reviewRes = await fetch('http://localhost:5002/api/chatgpt/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          question: currentQuestion.generatedQuestion,
          prompt: 'Review this code and give improvement suggestions and efficiency feedback based on question and code. what improvements they need to get solution of question.'
        }),
      });

      const reviewData = await reviewRes.json();
      setReview(reviewData.review || '⚠️ Review could not be generated.');
    } catch (err) {
      console.error('Error during code run or review:', err);
      setOutput('⚠️ Error running code.');
      setReview('⚠️ Error generating review.');
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5 display-6 fw-bold text-primary">Mock Interview Platform</h1>

      {!showEditor && (
        <div className="row g-4">
          {jobs.map((job) => (
            <div className="col-sm-6 col-lg-4" key={job._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-primary">{job.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{job.company}</h6>
                  <p className="text-muted mb-1">{job.location || 'Remote'}</p>
                  <p className="card-text flex-grow-1">{job.description}</p>
                  <p className="text-warning fw-bold">Difficulty: {job.difficulty}</p>
                  <div className="mb-2">
                    {job.language?.map((lang, idx) => (
                      <span key={idx} className="badge bg-info text-dark me-1">{lang}</span>
                    ))}
                  </div>
                  <button
                    className="btn btn-primary mt-auto"
                    onClick={async () => {
                      setShowEditor(true);
                      allLanguage();
                      setCurrentQuestion({
                        title: job.title,
                        description: job.description,
                        example: 'AI is generating random question based on job description and its difficulty level',
                        sample: 'AI is generating sample for above question',
                      });
                      try {
                        const questionRes = await fetch('http://localhost:5002/api/chatgpt/generate_question', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            jobDescription: job.description,
                            difficulty: job.difficulty,
                            prompt: `Make the question align with a ${job.title} role`,
                          }),
                        });

                        const questionData = await questionRes.json();
                        const generatedQuestion = questionData.sample || '⚠️ No question generated.';

                        const sampleRes = await fetch('http://localhost:5002/api/chatgpt', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ prompt: generatedQuestion }),
                        });

                        const sampleData = await sampleRes.json();

                        setCurrentQuestion({
                          title: job.title,
                          description: job.description,
                          example: generatedQuestion,
                          sample: sampleData.sample || '⚠️ No input/output sample generated.',
                        });

                      } catch (err) {
                        console.error('Error generating question/sample:', err);
                        setCurrentQuestion({
                          title: job.title,
                          description: job.description,
                          example: '⚠️ Error generating coding question.',
                          sample: '⚠️ Could not fetch sample input/output.',
                        });
                      }
                    }}
                  >
                    🚀 Start Interview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body">
                <h4 className="card-title">{currentQuestion?.title}</h4>
                <p className="card-text white-space-pre-line">{currentQuestion?.description}</p>
                {currentQuestion?.example && (
                  <>
                    <p className="bg-light p-3 border-start border-4 border-primary rounded">{currentQuestion.example}</p>
                    <div className="bg-light p-3 border-start border-4 border-primary rounded">
                      {currentQuestion.sample.split('\n').map((line, idx) => {
                        if (line.toLowerCase().startsWith('input')) {
                          return <p key={idx}><strong>🔢 {line}</strong></p>;
                        } else if (line.toLowerCase().startsWith('output')) {
                          return <p key={idx}><strong>✅ {line}</strong></p>;
                        } else {
                          return <p key={idx}>{line}</p>;
                        }
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body">
                {languages.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Select Language</label>
                    <select
                      className="form-select"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(Number(e.target.value))}
                    >
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <Editor
                  height="350px"
                  defaultLanguage="python"
                  value={code}
                  onChange={(val) => setCode(val)}
                  theme="vs-dark"
                />
                <div className="d-grid mt-3">
                  <button className="btn btn-success" onClick={runCode}>
                    ▶️ Run Code
                  </button>
                </div>

                {output && (
                  <div className="bg-dark text-success mt-4 p-3 rounded">
                    <h5 className="text-white">Output:</h5>
                    <pre>{output}</pre>
                  </div>
                )}

                {review && (
                  <div className="bg-light text-dark mt-4 p-3 rounded border-start border-4 border-info">
                    <h5 className="text-primary">🧠 AI Code Review:</h5>
                    <pre className="mb-0 white-space-pre-line">{review}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
