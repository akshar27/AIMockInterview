import React, { useEffect, useState } from 'react';
import ResumeUpload from '../components/ResumeUpload';

export default function ProfilePage({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5002/api/profile/${userId}`);
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Profile Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) return <p className="p-5 text-danger">❌ Please log in to view your profile.</p>;
  if (loading) return <p className="p-5">Loading profile...</p>;
  if (!profile) return <p className="p-5 text-danger">❌ Failed to load profile data.</p>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">👤 {profile.user.name}'s Profile</h2>
      <p><strong>Email:</strong> {profile.user.email}</p>
      <p><strong>Joined:</strong> {new Date(profile.user.createdAt).toLocaleDateString()}</p>

      <ResumeUpload userId={user.id || user._id} />
      <hr />

      <h4>📄 Jobs Applied</h4>
      <ul className="list-group mb-4">
        {profile.applications?.length > 0 ? (
          profile.applications.map((app, i) => (
            <li className="list-group-item" key={i}>
              <strong>{app.jobId?.title || 'Deleted Job'}</strong> at {app.jobId?.company || 'Unknown'}
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted">No job applications yet.</li>
        )}
      </ul>

      <h4>💻 Code Submissions</h4>
      <ul className="list-group">
        {profile.submissions?.length > 0 ? (
          profile.submissions.map((sub, i) => (
            <li className="list-group-item" key={i}>
              <p><strong>{sub.jobId?.title || 'Unknown Job'}:</strong> {sub.result}</p>
              <p className="text-muted"><small>{sub.feedback}</small></p>
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted">No code submissions yet.</li>
        )}
      </ul>
    </div>
  );
}
