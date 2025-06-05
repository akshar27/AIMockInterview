import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function ApplicationStatusPage() {
  const [applications, setApplications] = useState([]);
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  useEffect(() => {
    if (email) {
      fetch(`http://localhost:5002/api/drafts/${email}`)
        .then(res => res.json())
        .then(data => setApplications(data))
        .catch(err => console.error('Error fetching applications:', err));
    }
  }, [email]);

  const pending = applications.filter(app => app.status === 'pending_review');
  const submitted = applications.filter(app => app.status === 'submitted');

  return (
    <div className="container py-5">
      <h2 className="text-primary mb-4">📊 Application Status</h2>

      <div className="row">
        <div className="col-md-6">
          <h4>🕒 Pending Review</h4>
          {pending.length === 0 ? <p>No pending applications.</p> : (
            <ul className="list-group">
              {pending.map(app => (
                <li key={app._id} className="list-group-item">
                  <p><strong>Job:</strong> <a href={app.jobUrl} target="_blank" rel="noreferrer">{app.jobUrl}</a></p>
                  <p><strong>Created:</strong> {new Date(app.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-md-6">
          <h4>✅ Submitted</h4>
          {submitted.length === 0 ? <p>No submitted applications.</p> : (
            <ul className="list-group">
              {submitted.map(app => (
                <li key={app._id} className="list-group-item">
                  <p><strong>Job:</strong> <a href={app.jobUrl} target="_blank" rel="noreferrer">{app.jobUrl}</a></p>
                  <p><strong>Submitted:</strong> {new Date(app.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
