import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiBookmark } from 'react-icons/fi';
import { toggleSaveJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function JobCard({ job, savedIds = [] }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(savedIds.includes(job._id));
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error('Login to save jobs');
    if (user.role !== 'jobseeker') return;
    setSaving(true);
    try {
      const { data } = await toggleSaveJob(job._id);
      setSaved(data.saved);
      toast.success(data.saved ? 'Job saved!' : 'Removed from saved');
    } catch { toast.error('Failed to save job'); }
    finally { setSaving(false); }
  };

  return (
    <Link to={`/jobs/${job._id}`} className="card hover:shadow-md hover:border-blue-200 transition-all block group">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-blue-100 transition-colors">
          🏢
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors pr-8">{job.title}</h3>
          {job.company?._id ? (
            <Link to={`/companies/${job.company._id}`}
              onClick={e => e.stopPropagation()}
              className="text-sm text-blue-600 hover:underline truncate">
              {job.company?.name || 'Company'}
            </Link>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{job.company?.name || 'Company'}</p>
          )}
        </div>
        {/* Bookmark — top right, inside card, no overlap */}
        {user?.role === 'jobseeker' && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${saved ? 'text-blue-600 bg-blue-100' : 'text-gray-300 hover:text-blue-500 hover:bg-blue-50'}`}
            title={saved ? 'Saved' : 'Save job'}
          >
            <FiBookmark size={15} className={saved ? 'fill-current' : ''} />
          </button>
        )}
      </div>

      {/* Job type badge */}
      <div className="mt-2">
        <span className="badge bg-green-50 text-green-700 capitalize">{job.jobType}</span>
        {job.experience && <span className="badge bg-gray-100 text-gray-600 ml-1.5">{job.experience}</span>}
      </div>

      {/* Skills */}
      <div className="mt-2 flex flex-wrap gap-1">
        {job.skillsRequired?.slice(0, 3).map(s => (
          <span key={s} className="badge bg-blue-50 text-blue-700">{s}</span>
        ))}
        {job.skillsRequired?.length > 3 && (
          <span className="badge bg-gray-100 text-gray-500">+{job.skillsRequired.length - 3}</span>
        )}
      </div>

      {/* Footer row */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 flex-wrap">
        <span className="flex items-center gap-1"><FiMapPin size={11}/>{job.location}</span>
        {job.salary?.max > 0 && (
          <span className="flex items-center gap-1">
            <FiDollarSign size={11}/>${Number(job.salary.min).toLocaleString()} - ${Number(job.salary.max).toLocaleString()}
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <FiClock size={11}/>{new Date(job.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
