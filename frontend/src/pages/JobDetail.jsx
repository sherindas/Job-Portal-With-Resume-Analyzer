import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobById, applyForJob, getMyApplications } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { FiMapPin, FiClock, FiUsers, FiArrowLeft, FiCheckCircle, FiMessageCircle } from 'react-icons/fi';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [appStatus, setAppStatus] = useState('');
  const [appId, setAppId] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    getJobById(id)
      .then(({ data }) => setJob(data.job))
      .catch(() => toast.error('Job not found'))
      .finally(() => setLoading(false));

    // Check if already applied
    if (user?.role === 'jobseeker') {
      getMyApplications().then(({ data }) => {
        const existing = (data.applications || []).find(a => a.job?._id === id || a.job === id);
        if (existing) { setApplied(true); setAppStatus(existing.status); setAppId(existing._id); }
      }).catch(() => {});
    }
  }, [id, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setApplying(true);
    try {
      const fd = new FormData();
      fd.append('jobId', id);
      fd.append('coverLetter', coverLetter);
      if (resumeFile) fd.append('resume', resumeFile);
      const { data: applyData } = await applyForJob(fd);
      toast.success('Application submitted!');
      setApplied(true);
      setAppStatus('pending');
      setAppId(applyData.application?._id);
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/></div>;
  if (!job) return <div className="text-center py-20 text-gray-400">Job not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-5 transition-colors">
        <FiArrowLeft size={14}/> Back to Jobs
      </Link>

      {/* Header */}
      <div className="card mb-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-500 mt-1">{job.company?.name}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <StatusBadge status={job.status}/>
              <span className="badge bg-blue-50 text-blue-700 capitalize">{job.jobType}</span>
              {job.salary?.max > 0 && <span className="badge bg-green-50 text-green-700">${Number(job.salary.min).toLocaleString()} – ${Number(job.salary.max).toLocaleString()}/yr</span>}
              {job.experience && typeof job.experience === 'string' && <span className="badge bg-purple-50 text-purple-700">{job.experience}</span>}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
              <span className="flex items-center gap-1"><FiMapPin size={13}/>{job.location}</span>
              <span className="flex items-center gap-1"><FiUsers size={13}/>{job.applicants?.length || 0} applicants</span>
              <span className="flex items-center gap-1"><FiClock size={13}/>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {user?.role === 'jobseeker' && job.status === 'open' && (
            applied ? (
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl">
                  <FiCheckCircle size={16} />
                  <span className="font-medium text-sm">Applied</span>
                  {appStatus && <StatusBadge status={appStatus} />}
                </div>
                {appId && (
                  <button onClick={() => navigate('/messages', { state: { applicationId: appId } })}
                    className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium">
                    <FiMessageCircle size={15} /> Message Recruiter
                  </button>
                )}
              </div>
            ) : (
              <button onClick={() => setShowForm(!showForm)} className={`btn-primary px-8 py-2.5 flex-shrink-0 ${showForm ? 'bg-gray-500 hover:bg-gray-600' : ''}`}>
                {showForm ? 'Cancel' : 'Apply Now'}
              </button>
            )
          )}
          {!user && job.status === 'open' && (
            <Link to="/login" className="btn-primary px-8 py-2.5 flex-shrink-0">Login to Apply</Link>
          )}
        </div>
      </div>

      {/* Apply Form */}
      {showForm && (
        <div className="card mb-5 border-2 border-blue-200 bg-blue-50/30">
          <h2 className="font-semibold text-gray-900 mb-4">Submit Your Application</h2>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="label">Cover Letter</label>
              <textarea className="input" rows={4} placeholder="Tell the recruiter why you're a great fit for this role..."
                value={coverLetter} onChange={e => setCoverLetter(e.target.value)}/>
            </div>
            <div>
              <label className="label">Resume (PDF / DOCX)</label>
              <input type="file" accept=".pdf,.docx,.doc" onChange={e => setResumeFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>
            <button type="submit" className="btn-primary px-8" disabled={applying}>
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Job Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired?.map(s => <span key={s} className="badge bg-blue-50 text-blue-700 py-1 px-3 text-sm">{s}</span>)}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Job Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>📍 <span className="font-medium">Location:</span> {job.location}</div>
              <div>💼 <span className="font-medium">Type:</span> <span className="capitalize">{job.jobType}</span></div>
              <div>📅 <span className="font-medium">Posted:</span> {new Date(job.createdAt).toLocaleDateString()}</div>
              {job.deadline && <div>⏰ <span className="font-medium">Deadline:</span> {new Date(job.deadline).toLocaleDateString()}</div>}
            </div>
          </div>
          {job.company && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">About Company</h3>
              <p className="text-sm text-gray-600">{job.company.description || 'No description available.'}</p>
              {job.company.industry && <p className="text-xs text-gray-400 mt-2">🏭 {job.company.industry}</p>}
              {job.company.location && <p className="text-xs text-gray-400">📍 {job.company.location}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
