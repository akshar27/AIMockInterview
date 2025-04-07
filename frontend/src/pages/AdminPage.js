import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const [form, setForm] = useState({
    title: '',
    company: '',
    description: '',
    difficulty: '',
    question: '',
    language: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5002/api/admin/add-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          language: form.language.split(',').map((lang) => lang.trim()),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ Job added successfully!');
        setForm({ title: '', company: '', description: '', difficulty: '', question: '', language: '' });
        navigate('/');
      } else {
        setMessage(data.error || 'Something went wrong!');
      }
    } catch (error) {
      setMessage('❌ Server error while adding job');
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Admin - Add Job</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit} className="row g-3">
        {['title', 'company', 'description', 'difficulty', 'question', 'language'].map((field) => (
          <div className="col-12" key={field}>
            <label className="form-label text-capitalize">{field}</label>
            <textarea
              rows={field === 'description' || field === 'question' ? 4 : 1}
              className="form-control"
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
            />
            {field === 'language' && (
              <div className="form-text">Enter comma-separated languages, e.g., Python, JavaScript</div>
            )}
          </div>
        ))}
        <div className="col-12">
          <button type="submit" className="btn btn-success w-100">
            ➕ Add Job
          </button>
        </div>
      </form>
    </div>
  );
}
