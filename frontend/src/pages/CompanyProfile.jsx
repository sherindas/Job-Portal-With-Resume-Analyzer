import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicCompany } from '../services/api';
import JobCard from '../components/JobCard';
import { FiGlobe, FiMapPin, FiBriefcase, FiUsers, FiArrowLeft } from 'react-icons/fi';

export default function CompanyProfile() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublicCompany(id)
      .then(({ data }) => { setCompany(data.company); setJobs(data.jobs || []); })
      .catch(() => setError('Company not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
      <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
      <div className="text-5xl mb-3">🏢</div>
      <p className="text-lg font-medium">{error}</p>
      <Link to="/jobs" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Browse all jobs →</Link>
    </div>
  );

  const websiteUrl = company.website
    ? (company.website.startsWith('http') ? company.website : `https://${company.website}`)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-5 transition-colors">
        <FiArrowLeft size={14} /> Back to Jobs
      </Link>

      {/* Company header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600 shrink-0 overflow-hidden">
            {company.logo
              ? <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
              : company.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              {company.industry && (
                <span className="flex items-center gap-1.5"><FiBriefcase size={14} /> {company.industry}</span>
              )}
              {company.location && (
                <span className="flex items-center gap-1.5"><FiMapPin size={14} /> {company.location}</span>
              )}
              {company.size && (
                <span className="flex items-center gap-1.5"><FiUsers size={14} /> {company.size} employees</span>
              )}
            </div>
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                <FiGlobe size={14} /> {company.website}
              </a>
            )}
          </div>
        </div>

        {company.description && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {company.description}
            </p>
          </div>
        )}
      </div>

      {/* Open jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-lg">
            Open Positions <span className="text-gray-400 font-normal text-base">({jobs.length})</span>
          </h2>
        </div>
        {jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <FiBriefcase size={36} className="mx-auto mb-2 opacity-30" />
            <p>No open positions right now</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {jobs.map(job => <JobCard key={job._id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  );
}
