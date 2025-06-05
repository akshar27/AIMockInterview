import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ApplyForm() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    workAuth: 'Yes',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('resume', resumeFile);
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const res = await fetch('http://localhost:5002/api/apply/auto', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.status === 'draft_ready') {
      setPreviewData(data);
      navigate('/review-application', { state: { data, user: form.email } });
    } else {
      alert(`⚠️ ${data.message || 'Something went wrong.'}`);
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-6">
          <h2 className="text-center mb-4 text-primary">🤖 AI Auto Apply Form</h2>
          <form onSubmit={handleSubmit} className="card p-4 shadow-sm" encType="multipart/form-data">
            <div className="mb-3">
              <label className="form-label">First Name</label>
              <input type="text" className="form-control" name="firstName" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Last Name</label>
              <input type="text" className="form-control" name="lastName" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Job Title to Search</label>
              <input type="text" className="form-control" name="jobTitle" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Upload Resume</label>
              <input type="file" className="form-control" onChange={handleFileChange} accept=".pdf,.doc,.docx" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Are you authorized to work in the U.S.?</label>
              <select name="workAuth" className="form-select" onChange={handleChange}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success w-100">🚀 Apply via AI</button>
          </form>
        </div>

        {previewData && (
          <div className="col-md-6">
            <h4 className="text-secondary">🔍 Preview Questions & Answers</h4>
            <div className="card shadow-sm p-3">
              <p><strong>Job:</strong> {previewData.jobUrl}</p>
              <ul>
                {previewData.qaPairs.map((pair, idx) => (
                  <li key={idx}><strong>{pair.question}:</strong> {pair.answer}</li>
                ))}
              </ul>
              <p className="text-muted">⬇ Review & confirm on the next page</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
