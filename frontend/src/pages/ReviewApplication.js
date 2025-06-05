import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function ReviewApplication() {
  const [drafts, setDrafts] = useState([]);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [answers, setAnswers] = useState({});
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  useEffect(() => {
    if (email) {
      fetch(`http://localhost:5002/api/drafts/${email}`)
        .then(res => res.json())
        .then(data => {
          setDrafts(data);
          const initial = {};
          data.forEach(draft => {
            initial[draft._id] = draft.qaPairs.map(q => q.answer);
          });
          setAnswers(initial);
        })
        .catch(err => console.error('Error fetching drafts:', err));
    }
  }, [email]);

  const handleEditChange = (draftId, index, newVal) => {
    setAnswers(prev => {
      const updated = [...(prev[draftId] || [])];
      updated[index] = newVal;
      return { ...prev, [draftId]: updated };
    });
  };

  const handleConfirm = async (draft) => {
    const updatedPairs = draft.qaPairs.map((pair, idx) => ({
      question: pair.question,
      answer: answers[draft._id][idx]
    }));

    const res = await fetch(`http://localhost:5002/api/drafts/${draft._id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qaPairs: updatedPairs
      })
    });

    const result = await res.json();
    alert(`✅ ${result.message}`);
    setEditingDraftId(null);
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-primary">📄 Review Your Applications</h2>
      {drafts.length === 0 ? (
        <p>No drafts found. Please submit an application first.</p>
      ) : (
        drafts.map((draft) => (
          <div key={draft._id} className="card mb-4 shadow-sm p-4">
            <p><strong>Job URL:</strong> <a href={draft.jobUrl} target="_blank" rel="noreferrer">{draft.jobUrl}</a></p>
            <p><strong>Status:</strong> {draft.status}</p>
            <h5>🧠 Questions & Answers</h5>
            <ul className="list-unstyled">
              {draft.qaPairs.map((pair, idx) => (
                <li key={idx} className="mb-2">
                  <strong>{pair.question}</strong><br />
                  {editingDraftId === draft._id ? (
                    <textarea
                      className="form-control"
                      value={answers[draft._id]?.[idx] || ''}
                      onChange={(e) => handleEditChange(draft._id, idx, e.target.value)}
                    />
                  ) : (
                    <p>{answers[draft._id]?.[idx] || pair.answer}</p>
                  )}
                </li>
              ))}
            </ul>
            {editingDraftId === draft._id ? (
              <button className="btn btn-success" onClick={() => handleConfirm(draft)}>
                ✅ Confirm & Submit
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setEditingDraftId(draft._id)}>
                ✏️ Edit Answers
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
