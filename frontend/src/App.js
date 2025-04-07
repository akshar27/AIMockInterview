import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import MainApp from './pages/MainApp'; 
import AdminPage from './pages/AdminPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  const [user, setUser] = useState(null);

  const handleAuth = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
        <Link className="navbar-brand" to="/">Mock Interview</Link>
        <div className="ms-auto d-flex gap-2">
          {user ? (
            <>
              <span className="navbar-text me-2">👤 {user.name}</span>
              <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-success">Login</Link>
              <Link to="/signup" className="btn btn-outline-primary">Signup</Link>
              <Link to="/admin" className="btn btn-outline-warning">🛠 Admin</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={user ? <MainApp /> : <Navigate to="/login" />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/signup" element={<Signup onAuth={handleAuth} />} />
        <Route path="/login" element={<Login onAuth={handleAuth} />} />
      </Routes>
    </Router>
  );
}
