import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onAuth }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      // ✅ Ensure user has an `id` field
      const userWithId = {
        ...data.user,
        id: data.user.id || data.user._id,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithId));
      onAuth(userWithId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2>Login</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        {['email', 'password'].map((field) => (
          <div key={field} className="mb-3">
            <label htmlFor={field} className="form-label">{field}</label>
            <input
              type={field === 'password' ? 'password' : 'email'}
              name={field}
              id={field}
              value={form[field]}
              onChange={handleChange}
              className="form-control"
              required
              minLength={field === 'password' ? 6 : undefined}
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
