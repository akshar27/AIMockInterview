import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainApp from './MainApp'; 
import AdminPage from './AdminPage';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
        <Link className="navbar-brand" to="/">Mock Interview</Link>
        <div className="ms-auto">
          <Link to="/admin" className="btn btn-outline-primary">🛠 Admin</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
