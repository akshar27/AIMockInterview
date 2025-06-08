import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';

export default function MainApp({ user }) {
  const [showEditor, setShowEditor] = useState(false);
  const [code, setCode] = useState('// Write your solution here');
  const [output, setOutput] = useState('');
  const [review, setReview] = useState('');
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(71);
  const [jobs, setJobs] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sourceToggle, setSourceToggle] = useState('gfg');
  const [validationResult, setValidationResult] = useState('');

  const navigate = useNavigate();

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
      const response = await fetch(
        'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'X-RapidAPI-Key': '1953ed96cemsh8936373af3efcccp1d398ejsnfbcdd576ead7'
          },
          body: JSON.stringify({ source_code: code, language_id: selectedLanguage, stdin: '' })
        }
      );
      const result = await response.json();
      const finalOutput = result.stdout || result.stderr || 'No output';
      setOutput(finalOutput);

      const reviewRes = await fetch('http://localhost:5002/api/chatgpt/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          question: currentQuestion?.example,
          prompt: 'Review this code and give improvement suggestions and efficiency feedback.'
        })
      });
      const reviewData = await reviewRes.json();
      const finalReview = reviewData.review || '⚠️ Review could not be generated.';
      setReview(finalReview);

      await fetch('http://localhost:5002/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: currentQuestion._id,
          userId: user._id,
          code,
          language: selectedLanguage,
          result: finalOutput,
          feedback: finalReview
        })
      });
    } catch (err) {
      console.error('Error during code run or review:', err);
      setOutput('⚠️ Error running code.');
      setReview('⚠️ Error generating review.');
    }
  };

  // const validateCode = async () => {
  //   if (!currentQuestion?.testCases || currentQuestion.testCases.length === 0) {
  //     return setValidationResult('⚠️ No test cases available for validation.');
  //   }

  //   try {
  //     let allPassed = true;
  //     for (const test of currentQuestion.testCases) {
  //       const res = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
  //           'X-RapidAPI-Key': '1953ed96cemsh8936373af3efcccp1d398ejsnfbcdd576ead7'
  //         },
  //         body: JSON.stringify({
  //           source_code: code,
  //           language_id: selectedLanguage,
  //           stdin: test.input,
  //           expected_output: test.output
  //         })
  //       });

  //       const result = await res.json();
  //       if (!result.stdout || result.stdout.trim() !== test.output.trim()) {
  //         allPassed = false;
  //         setValidationResult(`❌ Failed for input: ${test.input}\nExpected: ${test.output}\nGot: ${result.stdout}`);
  //         break;
  //       }
  //     }
  //     if (allPassed) setValidationResult('✅ All test cases passed!');
  //   } catch (err) {
  //     console.error('❌ Validation error:', err);
  //     setValidationResult('⚠️ Error during validation.');
  //   }
  // };

  const validateCode = async () => {
    if (!currentQuestion?.testCases || currentQuestion.testCases.length === 0) {
      return setValidationResult('⚠️ No test cases available for validation.');
    }
  
    let results = [];
    let passedCount = 0;
  
    try {
      for (const [index, test] of currentQuestion.testCases.entries()) {
        const res = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'X-RapidAPI-Key': '1953ed96cemsh8936373af3efcccp1d398ejsnfbcdd576ead7'
          },
          body: JSON.stringify({
            source_code: code,
            language_id: selectedLanguage,
            stdin: test.input
          })
        });
  
        const result = await res.json();
        const actualOutput = result.stdout?.trim() || '';
        const expectedOutput = test.output.trim();
  
        const isPassed = actualOutput === expectedOutput;
        if (isPassed) passedCount++;
  
        results.push({
          index: index + 1,
          input: test.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed: isPassed
        });
      }
  
      const total = results.length;
      let summary = `✅ Passed ${passedCount}/${total} test cases.\n\n`;
  
      results.forEach((res) => {
        summary += `${res.passed ? '✅ Passed' : '❌ Failed'} - Test Case ${res.index}\n`;
        summary += `🔢 Input: ${res.input}\n`;
        summary += `✅ Expected: ${res.expected}\n`;
        summary += `💻 Got: ${res.actual}\n\n`;
      });
  
      setValidationResult(summary.trim());
    } catch (err) {
      console.error('❌ Validation error:', err);
      setValidationResult('⚠️ Error during validation.');
    }
  };
  

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5 display-6 fw-bold text-primary">🚧 Job Postings & Code Challenges</h1>

      {!showEditor && (
        <>
          <div className="d-flex justify-content-between mb-3">
            <button
              className="btn btn-outline-dark"
              onClick={() => navigate('/apply-form')}
            >
              🤖 AI Auto Apply All
            </button>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="toggleSource"
                checked={sourceToggle === 'leetcode'}
                onChange={() => setSourceToggle(sourceToggle === 'gfg' ? 'leetcode' : 'gfg')}
              />
              <label className="form-check-label" htmlFor="toggleSource">
                {sourceToggle === 'gfg' ? '🧠 GFG Mode' : '📘 LeetCode Mode'}
              </label>
            </div>
          </div>

          <div className="row g-4">
            {jobs.map((job) => (
              <div className="col-sm-6 col-lg-4" key={job._id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-primary">{job.title}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{job.company}</h6>
                    <p className="text-muted mb-1">{job.location || 'Remote'}</p>
                    <p className="card-text flex-grow-1">{job.description.length > 100 ? `${job.description.slice(0, 100)}...` : job.description}</p>
                    <p className="text-warning fw-bold">Difficulty: {job.difficulty}</p>
                    <div className="mb-2">
                      {job.language?.map((lang, idx) => (
                        <span key={idx} className="badge bg-info text-dark me-1">{lang}</span>
                      ))}
                    </div>
                    <button
                      className="btn btn-primary mt-auto"
                      onClick={async () => {
                        try {
                          setShowEditor(true);
                          await allLanguage();
                      
                          const endpoint = sourceToggle === 'leetcode'
                            ? 'http://localhost:5002/api/leetcode/ai-match'
                            : 'http://localhost:5002/api/gfg/ai-match';
                      
                          const res = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              title: job.title,
                              description: job.description,
                              difficulty: job.difficulty
                            })
                          });
                      
                          const responseJson = await res.json();
                          console.log("🧠 AI Response:", responseJson); // 🔍 Log AI output
                      
                          if (responseJson.error) {
                            alert("❌ Error: " + responseJson.error);
                            return;
                          }
                      
                          let question = {
                            title: '',
                            company: job.company,
                            description: job.description,
                            example: '',
                            sample: '',
                            testCases: responseJson.testCases || [],
                            _id: job._id
                          };
                      
                          if (responseJson.problem && responseJson.input && responseJson.output) {
                            // ✅ LeetCode format
                            question.title = responseJson.title || job.title;
                            question.example = responseJson.problem || '';
                            question.sample = `🔢 Input: ${responseJson.input}\n✅ Output: ${responseJson.output}\n🧠 Explanation: ${responseJson.explanation}`;
                          } else if (typeof responseJson.result === 'string') {
                            // ✅ GFG format
                            const result = responseJson.result;
                            question.title = result.match(/Title:\s*(.*)/)?.[1]?.trim() || job.title;
                            question.example = result.match(/Problem:\s*([\s\S]*?)\nInput:/)?.[1]?.trim() || '';
                            const input = result.match(/Input:\s*([\s\S]*?)\nOutput:/)?.[1]?.trim() || '';
                            const output = result.match(/Output:\s*([\s\S]*?)\nExplanation:/)?.[1]?.trim() || '';
                            const explanation = result.match(/Explanation:\s*([\s\S]*)/)?.[1]?.trim() || '';
                            question.sample = `🔢 Input: ${input}\n✅ Output: ${output}\n🧠 Explanation: ${explanation}`;
                          } else {
                            alert("⚠️ Invalid question format received from AI.");
                            console.log("❌ Unrecognized structure:", responseJson);
                            return;
                          }
                      
                          setCurrentQuestion(question);
                        } catch (err) {
                          console.error("❌ Failed to generate question:", err);
                          alert("Something went wrong while generating the question.");
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
        </>
      )}

      {showEditor && currentQuestion && (
        <div className="row g-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-body">
              <h4 className="card-title text-primary">{currentQuestion.title}</h4>

                <div className="mb-3">
                  <h6 className="fw-bold text-muted">🏢 Company:</h6>
                  <p>{currentQuestion.company}</p>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-muted">📄 Job Description:</h6>
                  <p className="white-space-pre-line">{currentQuestion.description}</p>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-muted">🧠 Problem Statement:</h6>
                  <p className="white-space-pre-line bg-light p-3 border-start border-4 border-primary rounded">
                    {currentQuestion.example}
                  </p>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-muted">📘 Sample I/O + Explanation:</h6>
                  <pre className="bg-light p-3 border-start border-4 border-secondary rounded">
                    {currentQuestion.sample}
                  </pre>
                </div>

              </div>
            </div>
          </div>

          <div className="col-12">
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
                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <Editor
                  height="400px"
                  defaultLanguage="python"
                  value={code}
                  onChange={(val) => setCode(val)}
                  theme="vs-dark"
                />
                <div className="d-flex gap-3 mt-3">
                  <button className="btn btn-success w-100" onClick={runCode}>▶️ Run Code</button>
                  <button className="btn btn-warning w-100" onClick={validateCode}>🧪 Validate</button>
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

                {validationResult && (
                  <div className="mt-3 alert alert-info">
                    <strong>Validation:</strong>
                    <pre className="mb-0">{validationResult}</pre>
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
