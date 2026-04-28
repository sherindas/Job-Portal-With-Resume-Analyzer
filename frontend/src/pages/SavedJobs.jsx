import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSavedJobs, toggleSaveJob } from '../services/api';
import JobCard from '../components/JobCard';
import { FiBookmark } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedJobs()
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(() => toast.error('Failed to load saved jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await toggleSaveJob(jobId);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      toast.success('Job removed from saved');
    } catch { toast.error('Failed to unsave job'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiBookmark className="text-blue-600" /> Saved Jobs
          </h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} saved job{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/jobs" className="btn-primary text-sm py-2 px-5">Browse More</Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-44 bg-gray-50" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <FiBookmark size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">No saved jobs yet</p>
          <p className="text-sm mt-1">Browse jobs and click the bookmark icon to save them</p>
          <Link to="/jobs" className="btn-primary mt-4 inline-block px-6 py-2">Browse Jobs</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <div key={job._id} className="relative">
              <JobCard job={job} />
              <button onClick={() => handleUnsave(job._id)}
                className="absolute top-3 right-3 p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                title="Remove from saved">
                <FiBookmark size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
