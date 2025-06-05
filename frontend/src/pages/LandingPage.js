// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero-ai.svg'; // Make sure the image exists

export default function LandingPage() {
  return (
    <div className="container py-5 text-center">
      <div className="row align-items-center">
        <div className="col-md-6">
          <h1 className="display-4 fw-bold text-primary">🚀 AI Job Assistant</h1>
          <p className="lead text-muted">
            Auto-apply to jobs, ace mock interviews, and get instant code reviews using AI.
          </p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
            <Link to="/dashboard" className="btn btn-outline-dark btn-lg">Try Demo</Link>
          </div>
        </div>
        <div className="col-md-6">
          <img
            src={heroImage}
            alt="AI Assistant"
            className="img-fluid rounded shadow"
          />
        </div>
      </div>

      <hr className="my-5" />

      <div className="row text-start">
        <div className="col-md-4">
          <h4>🤖 One-Click Job Applications</h4>
          <p>Auto-fill job forms on LinkedIn using Puppeteer and your resume.</p>
        </div>
        <div className="col-md-4">
          <h4>🧠 AI-Powered Code Reviews</h4>
          <p>Get feedback and improvements on your coding skills instantly using LLMs.</p>
        </div>
        <div className="col-md-4">
          <h4>💼 Real Job Listings</h4>
          <p>Practice coding challenges from actual job descriptions scraped from LinkedIn.</p>
        </div>
      </div>
    </div>
  );
}
