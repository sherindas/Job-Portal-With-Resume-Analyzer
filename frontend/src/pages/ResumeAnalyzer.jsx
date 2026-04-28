import React, { useState, useRef } from 'react';
import { analyzeResume } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiUpload, FiFileText, FiCheckCircle, FiAlertCircle,
  FiXCircle, FiTarget, FiZap, FiAward, FiTrendingUp
} from 'react-icons/fi';

function ScoreRing({ score, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill={color} fontSize="22" fontWeight="bold"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        {score}
      </text>
      <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle"
        fill="#6b7280" fontSize="9"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        /100
      </text>
    </svg>
  );
}

function ScoreBar({ label, value, max, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [jobSkills, setJobSkills] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card text-center max-w-sm w-full">
          <FiAlertCircle size={40} className="text-yellow-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-500 text-sm mb-4">Please log in to use the Resume Analyzer.</p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full py-2.5">Go to Login</button>
        </div>
      </div>
    );
  }

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      setError('Only PDF or DOCX files are supported.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) { setError('File must be under 5MB.'); return; }
    setFile(f);
    setError('');
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return setError('Please upload a resume first.');
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const skills = jobSkills.split(',').map(s => s.trim()).filter(Boolean);
      if (skills.length) fd.append('jobSkills', JSON.stringify(skills));
      const { data } = await analyzeResume(fd);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const scoreLabel = (s) => s >= 75 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Needs Work';
  const scoreBg = (s) => s >= 75 ? 'bg-green-50 border-green-200' : s >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
  const scoreText = (s) => s >= 75 ? 'text-green-700' : s >= 60 ? 'text-yellow-700' : 'text-red-700';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-3">
            <FiTarget className="text-blue-600" size={26} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Analyzer</h1>
          <p className="text-gray-500 mt-2">Upload your resume to get an ATS score, skill gap analysis, and improvement tips</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Panel */}
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                ${dragging ? 'border-blue-400 bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'}`}>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden"
                onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <div>
                  <FiCheckCircle size={36} className="text-green-500 mx-auto mb-2" />
                  <p className="font-semibold text-green-700">{file.name}</p>
                  <p className="text-sm text-green-600 mt-1">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
                </div>
              ) : (
                <div>
                  <FiUpload size={36} className="text-gray-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700">Drop your resume here</p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse — PDF, DOCX (max 5MB)</p>
                </div>
              )}
            </div>

            {/* Job skills input */}
            <div className="card">
              <label className="label flex items-center gap-2">
                <FiZap size={14} className="text-blue-500" /> Job Skills (optional — for ATS match)
              </label>
              <textarea className="input" rows={3}
                placeholder="e.g. React, Node.js, MongoDB, TypeScript (comma separated)"
                value={jobSkills} onChange={e => setJobSkills(e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Paste skills from a job description to get a keyword match score</p>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3">
                <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <button onClick={handleAnalyze} disabled={loading || !file}
              className="btn-primary w-full py-3 text-base disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : 'Analyze Resume'}
            </button>
          </div>

          {/* Results Panel */}
          <div>
            {!result && !loading && (
              <div className="card h-full flex flex-col items-center justify-center text-center py-16 text-gray-400">
                <FiFileText size={48} className="mb-3 opacity-30" />
                <p className="font-medium">Your results will appear here</p>
                <p className="text-sm mt-1">Upload a resume and click Analyze</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Overall score */}
                <div className={`card border-2 ${scoreBg(result.total)}`}>
                  <div className="flex items-center gap-6">
                    <ScoreRing score={result.total} />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Overall Score</p>
                      <p className={`text-2xl font-bold ${scoreText(result.total)}`}>{scoreLabel(result.total)}</p>
                      <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-sm font-medium border ${result.atsCompatible ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                        {result.atsCompatible ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                        {result.atsCompatible ? 'ATS Compatible' : 'Not ATS Ready'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiTrendingUp size={16} className="text-blue-500" /> Score Breakdown
                  </h3>
                  <div className="space-y-3">
                    <ScoreBar label="Skills Match" value={result.skillScore} max={40} color="bg-blue-500" />
                    <ScoreBar label="Experience" value={result.expScore} max={30} color="bg-purple-500" />
                    <ScoreBar label="Formatting" value={result.fmtScore} max={20} color="bg-green-500" />
                    <ScoreBar label="Keywords" value={result.kwScore} max={10} color="bg-yellow-500" />
                  </div>
                  {result.keywordMatch > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Job Keyword Match</span>
                        <span className="font-bold text-blue-600">{result.keywordMatch}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-700"
                          style={{ width: `${result.keywordMatch}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Extracted info */}
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiFileText size={16} className="text-blue-500" /> Extracted Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    {result.parsedData?.name && <p><span className="text-gray-500">Name:</span> <span className="font-medium">{result.parsedData.name}</span></p>}
                    {result.parsedData?.email && <p><span className="text-gray-500">Email:</span> <span className="font-medium">{result.parsedData.email}</span></p>}
                    {result.parsedData?.phone && <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{result.parsedData.phone}</span></p>}
                  </div>
                  {result.parsedData?.skills?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-2">Detected Skills ({result.parsedData.skills.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.parsedData.skills.map(s => (
                          <span key={s} className="badge bg-blue-50 text-blue-700 border border-blue-100">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {result.suggestions?.length > 0 && (
                  <div className="card border border-yellow-200 bg-yellow-50">
                    <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                      <FiAward size={16} /> Improvement Tips
                    </h3>
                    <ul className="space-y-2">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-yellow-800">
                          <span className="mt-0.5 w-5 h-5 rounded-full bg-yellow-200 text-yellow-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
