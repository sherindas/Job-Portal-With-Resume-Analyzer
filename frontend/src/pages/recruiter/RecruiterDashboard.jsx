import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyJobs, deleteJob, getJobApplicants, updateAppStatus, getMyCompany, saveCompany, toggleJobStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import {
  FiBriefcase, FiUsers, FiPlus, FiEdit2, FiTrash2,
  FiEye, FiCheck, FiX, FiHome, FiTrendingUp, FiMessageCircle, FiFileText
} from 'react-icons/fi';

function ResumeModal({ url, name, onClose }) {
  const isPdf = url?.toLowerCase().endsWith('.pdf') || url?.includes('.pdf');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{name || 'Resume'}</p>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noreferrer" download
              className="text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">
              Download
            </a>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <FiX size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden rounded-b-2xl">
          {isPdf ? (
            <iframe src={url} title="Resume" className="w-full h-full min-h-[70vh]" />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <FiFileText size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Preview not available for this file type</p>
                <a href={url} target="_blank" rel="noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block">Open file →</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TABS = ['Overview', 'My Jobs', 'Applicants', 'Company'];

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [companyForm, setCompanyForm] = useState({ name: '', description: '', industry: '', location: '', website: '' });
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [resumeModal, setResumeModal] = useState(null); // { url, name }

  const fetchJobs = useCallback(async () => {
    try { const { data } = await getMyJobs(); setJobs(data.jobs || []); }
    catch { toast.error('Failed to load jobs'); }
  }, []);

  const fetchCompany = useCallback(async () => {
    try {
      const { data } = await getMyCompany();
      if (data.company) { setCompanyForm(data.company); }
    } catch { /* no company yet */ }
  }, []);

  useEffect(() => { fetchJobs(); fetchCompany(); }, [fetchJobs, fetchCompany]);

  const loadApplicants = async (job) => {
    setSelectedJob(job);
    setTab('Applicants');
    setLoadingApplicants(true);
    try {
      const { data } = await getJobApplicants(job._id);
      setApplicants(data.applicants || []);
    } catch { toast.error('Failed to load applicants'); }
    finally { setLoadingApplicants(false); }
  };

  const handleStatus = async (appId, status) => {
    try {
      await updateAppStatus(appId, { status });
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
      toast.success(`Applicant ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try { await deleteJob(id); setJobs(prev => prev.filter(j => j._id !== id)); toast.success('Job deleted'); }
    catch { toast.error('Failed to delete job'); }
  };

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await toggleJobStatus(id);
      setJobs(prev => prev.map(j => j._id === id ? { ...j, status: data.job.status } : j));
      toast.success(`Job ${data.job.status === 'open' ? 'reopened' : 'closed'}`);
    } catch { toast.error('Failed to update job status'); }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSavingCompany(true);
    try {
      const { data: companyData } = await saveCompany(companyForm);
      setCompanyForm(companyData.company);
      toast.success('Company profile saved!');
    } catch { toast.error('Failed to save company'); }
    finally { setSavingCompany(false); }
  };

  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {resumeModal && (
        <ResumeModal
          url={resumeModal.url}
          name={resumeModal.name}
          onClose={() => setResumeModal(null)}
        />
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.name}</p>
          </div>
          <Link to="/recruiter/post-job" className="btn-purple flex items-center gap-2">
            <FiPlus size={16} /> Post Job
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Active Jobs', value: jobs.filter(j => j.status !== 'closed').length, icon: FiBriefcase, color: 'purple' },
                { label: 'Total Applicants', value: totalApplicants, icon: FiUsers, color: 'blue' },
                { label: 'Jobs Posted', value: jobs.length, icon: FiTrendingUp, color: 'green' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-100`}>
                    <Icon className={`text-${color}-600`} size={22} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Recent Jobs</h2>
              {jobs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <FiBriefcase size={36} className="mx-auto mb-2 opacity-40" />
                  <p>No jobs posted yet</p>
                  <Link to="/recruiter/post-job" className="btn-purple mt-4 inline-flex items-center gap-2">
                    <FiPlus size={14} /> Post your first job
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map(job => (
                    <div key={job._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-500">{job.location} · {job.jobType}</p>                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{job.applicants?.length || 0} applicants</span>
                        <button onClick={() => loadApplicants(job)} className="text-purple-600 hover:text-purple-700 text-sm font-medium">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Jobs */}
        {tab === 'My Jobs' && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="card text-center py-14 text-gray-400">
                <FiBriefcase size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No jobs posted yet</p>
                <Link to="/recruiter/post-job" className="btn-purple mt-4 inline-flex items-center gap-2">
                  <FiPlus size={14} /> Post a Job
                </Link>
              </div>
            ) : jobs.map(job => (
              <div key={job._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <span className={`badge text-xs ${job.status === 'closed' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {job.status || 'active'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.location} · {job.jobType} · {job.experience || 'Any experience'}
                    </p>
                    {job.salary?.min > 0 && (
                      <p className="text-sm text-gray-600 mt-1">${Number(job.salary.min).toLocaleString()} – ${Number(job.salary.max).toLocaleString()}/yr</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(job.skillsRequired || []).slice(0, 4).map(s => (
                        <span key={s} className="badge bg-purple-50 text-purple-700 text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => loadApplicants(job)}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">
                      <FiEye size={14} /> {job.applicants?.length || 0} Applicants
                    </button>
                    <button onClick={() => handleToggleStatus(job._id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${job.status === 'closed' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'}`}>
                      {job.status === 'closed' ? 'Reopen' : 'Close'}
                    </button>
                    <button onClick={() => navigate(`/recruiter/edit-job/${job._id}`)}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(job._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Applicants */}
        {tab === 'Applicants' && (
          <div>
            {/* Job selector */}
            <div className="flex gap-2 flex-wrap mb-5">
              {jobs.map(j => (
                <button key={j._id} onClick={() => loadApplicants(j)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${selectedJob?._id === j._id ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-400'}`}>
                  {j.title}
                </button>
              ))}
              {jobs.length === 0 && <p className="text-gray-500 text-sm">Post a job first to see applicants.</p>}
            </div>

            {selectedJob && (
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Applicants for: <span className="text-purple-600">{selectedJob.title}</span>
                </h2>
                {loadingApplicants ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                  </div>
                ) : applicants.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <FiUsers size={36} className="mx-auto mb-2 opacity-40" />
                    <p>No applicants yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applicants.map(app => (
                      <div key={app._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                            {app.userId?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{app.userId?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{app.userId?.email}</p>
                            {app.userId?.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {app.userId.skills.slice(0, 3).map(s => (
                                  <span key={s} className="badge bg-blue-50 text-blue-600 text-xs">{s}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          <StatusBadge status={app.status} />
                          {app.resume && (
                            <button
                              onClick={() => setResumeModal({
                                url: `http://localhost:5000/${app.resume.replace(/^\/+/, '')}`,
                                name: `${app.userId?.name || 'Applicant'} — Resume`
                              })}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline border border-blue-200 rounded-lg px-2.5 py-1">
                              <FiFileText size={12} /> Resume
                            </button>
                          )}
                          <button onClick={() => navigate('/messages', { state: { applicationId: app._id } })}
                            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-medium">
                            <FiMessageCircle size={12} /> Message
                          </button>
                          {app.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleStatus(app._id, 'shortlisted')}
                                className="flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg font-medium">
                                <FiCheck size={12} /> Shortlist
                              </button>
                              <button onClick={() => handleStatus(app._id, 'rejected')}
                                className="flex items-center gap-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg font-medium">
                                <FiX size={12} /> Reject
                              </button>
                            </div>
                          )}
                          {app.status === 'shortlisted' && (
                            <button onClick={() => handleStatus(app._id, 'hired')}
                              className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-lg font-medium">
                              Mark Hired
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Company */}
        {tab === 'Company' && (
          <div className="max-w-xl">
            <div className="card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FiHome className="text-purple-600" size={20} />
                </div>
                <h2 className="font-semibold text-gray-900 text-lg">Company Profile</h2>
              </div>
              <form onSubmit={handleSaveCompany} className="space-y-4">
                <div>
                  <label className="label">Company Name</label>
                  <input className="input" value={companyForm.name}
                    onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Industry</label>
                  <select className="input" value={companyForm.industry}
                    onChange={e => setCompanyForm(f => ({ ...f, industry: e.target.value }))}>
                    <option value="">Select industry</option>
                    {['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Other'].map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" value={companyForm.location}
                    onChange={e => setCompanyForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input className="input" placeholder="https://company.com" value={companyForm.website}
                    onChange={e => setCompanyForm(f => ({ ...f, website: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input" rows={4} value={companyForm.description}
                    onChange={e => setCompanyForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <button type="submit" className="btn-purple w-full py-2.5" disabled={savingCompany}>
                  {savingCompany ? 'Saving...' : 'Save Company Profile'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
