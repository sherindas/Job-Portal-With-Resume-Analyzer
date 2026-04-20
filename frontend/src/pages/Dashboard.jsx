import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyApplications, withdrawApp, getRecommendedJobs } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import JobCard from '../components/JobCard';
import ProfileCompleteness from '../components/ProfileCompleteness';
import toast from 'react-hot-toast';
import { FiBookmark, FiMessageCircle } from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyApplications(),
      getRecommendedJobs(),
    ]).then(([appRes, recRes]) => {
      setApplications(appRes.data.applications || []);
      setRecommended(recRes.data.jobs || []);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await withdrawApp(id);
      setApplications(prev => prev.filter(a => a._id !== id));
      toast.success('Application withdrawn');
    } catch { toast.error('Failed to withdraw'); }
  };

  const stats = [
    { label: 'Total Applied', value: applications.length, icon: '📝', color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending', value: applications.filter(a => a.status === 'pending').length, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, icon: '⭐', color: 'bg-purple-50 text-purple-600' },
    { label: 'Hired', value: applications.filter(a => a.status === 'hired').length, icon: '✅', color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Track your job applications</p>
        </div>
        <div className="flex gap-3">
          <Link to="/messages" className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
            <FiMessageCircle size={14} /> Messages
          </Link>
          <Link to="/saved-jobs" className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
            <FiBookmark size={14} /> Saved Jobs
          </Link>
          <Link to="/jobs" className="btn-primary text-sm py-2 px-5">Browse Jobs</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-7">
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {stats.map(s => (
            <div key={s.label} className="card text-center py-5">
              <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center text-xl mx-auto mb-2`}>{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <ProfileCompleteness user={user} />
      </div>

      {/* Applications */}
      <div className="card mb-7">
        <h2 className="font-semibold text-gray-900 mb-4">My Applications</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />)}</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p>No applications yet.</p>
            <Link to="/jobs" className="text-blue-600 hover:underline text-sm mt-1 inline-block">Start applying →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">🏢</div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{app.job?.title}</p>
                    <p className="text-xs text-gray-400">{app.job?.company?.name} • Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  {app.status === 'pending' && (
                    <button onClick={() => handleWithdraw(app._id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Withdraw</button>
                  )}
                  <Link to="/messages" state={{ applicationId: app._id }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-2.5 py-1.5 hover:bg-blue-50 font-medium">
                    <FiMessageCircle size={12} /> Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Jobs */}
      {recommended.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recommended for You</h2>
            <Link to="/jobs" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map(job => <JobCard key={job._id} job={job} />)}
          </div>
        </div>
      )}
    </div>
  );
}
