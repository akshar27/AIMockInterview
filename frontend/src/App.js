import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import MainApp from './pages/MainApp'; 
import AdminPage from './pages/AdminPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './assets/navbar_logo.png'; 
import LandingPage from './pages/LandingPage';
import ApplyForm from './pages/ApplyForm';
import ReviewApplication from './pages/ReviewApplication';
import ApplicationStatusPage from './pages/ApplicationStatusPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    const parsed = JSON.parse(storedUser);
    return {
      ...parsed,
      id: parsed.id || parsed._id // ✅ Normalize id
    };
  });

  const handleAuth = (userData) => {
    const normalized = {
      ...userData,
      id: userData.id || userData._id
    };
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
        <Link className="navbar-brand" to={user ? "/dashboard" : "/"}>
          <img src={logo} alt="Mock Code Logo" style={{ height: '75px', width: '100px' }} />
        </Link>
        <div className="ms-auto d-flex gap-2">
          {user ? (
            <>
              <Link to={`/application-status?email=${user.email}`} className="btn btn-outline-info">
                📊 View Application Status
              </Link>
              <Link to="/profile" className="btn btn-outline-secondary">👤 Profile</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline-warning">🛠 Admin</Link>
              )}
              <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-success">Login</Link>
              <Link to="/signup" className="btn btn-outline-primary">Signup</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={user ? <MainApp user={user} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={<Signup onAuth={handleAuth} />} />
        <Route path="/login" element={<Login onAuth={handleAuth} />} />
        <Route path="/apply-form" element={user ? <ApplyForm user={user} /> : <Navigate to="/login" />} />
        <Route path="/review-application" element={<ReviewApplication />} />
        <Route path="/application-status" element={user ? <ApplicationStatusPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
