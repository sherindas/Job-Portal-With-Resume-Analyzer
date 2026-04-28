import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const JOB_TYPES = ['', 'full-time', 'part-time', 'remote', 'contract', 'internship'];

const SUGGESTIONS = [
  // Roles
  { value: 'Software Engineer',        type: 'role' },
  { value: 'Frontend Developer',       type: 'role' },
  { value: 'Backend Developer',        type: 'role' },
  { value: 'Full Stack Developer',     type: 'role' },
  { value: 'React Developer',          type: 'role' },
  { value: 'Node.js Developer',        type: 'role' },
  { value: 'Python Developer',         type: 'role' },
  { value: 'Data Scientist',           type: 'role' },
  { value: 'DevOps Engineer',          type: 'role' },
  { value: 'UI/UX Designer',           type: 'role' },
  { value: 'Product Manager',          type: 'role' },
  { value: 'Machine Learning Engineer',type: 'role' },
  { value: 'Android Developer',        type: 'role' },
  { value: 'iOS Developer',            type: 'role' },
  { value: 'QA Engineer',              type: 'role' },
  { value: 'Cloud Engineer',           type: 'role' },
  { value: 'Data Analyst',             type: 'role' },
  { value: 'Blockchain Developer',     type: 'role' },
  // Skills
  { value: 'React',        type: 'skill' },
  { value: 'Node.js',      type: 'skill' },
  { value: 'Python',       type: 'skill' },
  { value: 'JavaScript',   type: 'skill' },
  { value: 'TypeScript',   type: 'skill' },
  { value: 'Java',         type: 'skill' },
  { value: 'AWS',          type: 'skill' },
  { value: 'Docker',       type: 'skill' },
  { value: 'MongoDB',      type: 'skill' },
  { value: 'PostgreSQL',   type: 'skill' },
  { value: 'Kubernetes',   type: 'skill' },
  { value: 'Flutter',      type: 'skill' },
  { value: 'Next.js',      type: 'skill' },
  { value: 'GraphQL',      type: 'skill' },
  // Locations
  { value: 'Remote',        type: 'location' },
  { value: 'Hybrid',        type: 'location' },
  { value: 'Bangalore',     type: 'location' },
  { value: 'Mumbai',        type: 'location' },
  { value: 'Delhi',         type: 'location' },
  { value: 'Hyderabad',     type: 'location' },
  { value: 'Chennai',       type: 'location' },
  { value: 'Pune',          type: 'location' },
  { value: 'New York',      type: 'location' },
  { value: 'San Francisco', type: 'location' },
  { value: 'London',        type: 'location' },
  { value: 'Singapore',     type: 'location' },
  { value: 'Dubai',         type: 'location' },
  { value: 'Toronto',       type: 'location' },
];

const TYPE_STYLE = {
  role:     'bg-purple-100 text-purple-600',
  skill:    'bg-blue-100 text-blue-600',
  location: 'bg-green-100 text-green-600',
  company:  'bg-orange-100 text-orange-600',
  job:      'bg-gray-100 text-gray-500',
};

// Detect what the query looks like and route it to the right filter param
function classifyQuery(val) {
  const lower = val.toLowerCase();
  const isLocation = SUGGESTIONS.some(s => s.type === 'location' && s.value.toLowerCase() === lower);
  if (isLocation) return 'location';
  const isSkill = SUGGESTIONS.some(s => s.type === 'skill' && s.value.toLowerCase() === lower);
  if (isSkill) return 'keyword';
  return 'keyword'; // default — covers roles, skills, company names, free text
}

export default function Jobs() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    keyword:  searchParams.get('keyword')  || '',
    location: searchParams.get('location') || '',
    company:  searchParams.get('company')  || '',
    jobType:  '',
    sort:     'newest',
  });

  const [input, setInput] = useState(
    searchParams.get('keyword') || searchParams.get('location') || searchParams.get('company') || ''
  );
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [liveTitles, setLiveTitles] = useState([]);
  const [liveCompanies, setLiveCompanies] = useState([]);
  const inputRef = useRef();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filters.keyword)  params.keyword  = filters.keyword;
      if (filters.location) params.location = filters.location;
      if (filters.company)  params.company  = filters.company;
      if (filters.jobType)  params.jobType  = filters.jobType;
      if (filters.sort === 'salary') params.sort = 'salary';
      const { data } = await getJobs(params);
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      // Accumulate live titles and company names for suggestions
      const titles = (data.jobs || []).map(j => j.title).filter(Boolean);
      const companies = (data.jobs || []).map(j => j.company?.name).filter(Boolean);
      setLiveTitles(prev => [...new Set([...prev, ...titles])]);
      setLiveCompanies(prev => [...new Set([...prev, ...companies])]);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Build suggestions from single input
  useEffect(() => {
    const q = input.trim().toLowerCase();
    if (!q) { setSuggestions([]); return; }

    const staticMatches = SUGGESTIONS
      .filter(s => s.value.toLowerCase().includes(q))
      .slice(0, 6);

    const titleMatches = liveTitles
      .filter(t => t.toLowerCase().includes(q) && !SUGGESTIONS.find(s => s.value.toLowerCase() === t.toLowerCase()))
      .slice(0, 3)
      .map(t => ({ value: t, type: 'job' }));

    const companyMatches = liveCompanies
      .filter(c => c.toLowerCase().includes(q) && !SUGGESTIONS.find(s => s.value.toLowerCase() === c.toLowerCase()))
      .slice(0, 3)
      .map(c => ({ value: c, type: 'company' }));

    const seen = new Set();
    const merged = [...staticMatches, ...titleMatches, ...companyMatches].filter(s => {
      if (seen.has(s.value.toLowerCase())) return false;
      seen.add(s.value.toLowerCase());
      return true;
    }).slice(0, 10);

    setSuggestions(merged);
  }, [input, liveTitles, liveCompanies]);

  const applySearch = (val) => {
    const q = (val ?? input).trim();
    setShowSuggestions(false);
    if (!q) {
      setFilters(f => ({ ...f, keyword: '', location: '', company: '' }));
      setPage(1);
      return;
    }
    // Route to correct filter based on type
    const match = SUGGESTIONS.find(s => s.value.toLowerCase() === q.toLowerCase());
    if (match?.type === 'location') {
      setFilters(f => ({ ...f, keyword: '', company: '', location: q }));
    } else if (match?.type === 'company' || liveCompanies.map(c => c.toLowerCase()).includes(q.toLowerCase())) {
      setFilters(f => ({ ...f, keyword: '', location: '', company: q }));
    } else {
      setFilters(f => ({ ...f, location: '', company: '', keyword: q }));
    }
    setPage(1);
  };

  const selectSuggestion = (s) => {
    setInput(s.value);
    if (s.type === 'location') {
      setFilters(f => ({ ...f, keyword: '', company: '', location: s.value }));
    } else if (s.type === 'company') {
      setFilters(f => ({ ...f, keyword: '', location: '', company: s.value }));
    } else {
      setFilters(f => ({ ...f, location: '', company: '', keyword: s.value }));
    }
    setPage(1);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setInput('');
    setFilters(f => ({ ...f, keyword: '', location: '', company: '' }));
    setPage(1);
  };

  const applyFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1); };

  const activeSearch = filters.keyword || filters.location || filters.company;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 text-sm mt-1">{total} opportunities available</p>
      </div>

      {/* Search & Filters */}
      <div className="card mb-6">
        {/* Single search box */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
              <FiSearch className="text-gray-400 shrink-0" size={16} />
              <input
                ref={inputRef}
                className="flex-1 outline-none text-sm py-3 bg-transparent"
                placeholder="Search by job title, skill, company, or location..."
                value={input}
                onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={e => e.key === 'Enter' && applySearch()}
              />
              {input && (
                <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button type="button" onMouseDown={() => selectSuggestion(s)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between gap-2 transition-colors">
                      <span className="flex items-center gap-2">
                        <FiSearch size={12} className="text-gray-400 shrink-0" />
                        {s.value}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${TYPE_STYLE[s.type] || TYPE_STYLE.job}`}>
                        {s.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={() => applySearch()} className="btn-primary px-6">
            Search
          </button>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-2 items-center">
          <FiFilter size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400 mr-1">Type:</span>
          {JOB_TYPES.map(t => (
            <button key={t} onClick={() => applyFilter('jobType', t)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors capitalize
                ${filters.jobType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t || 'All'}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {[['newest', '🕐 Newest'], ['salary', '💰 Salary']].map(([v, l]) => (
              <button key={v} onClick={() => applyFilter('sort', v)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors
                  ${filters.sort === v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {(activeSearch || filters.jobType) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Active:</span>
            {filters.keyword && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                🔍 {filters.keyword}
                <button onClick={clearSearch}><FiX size={10} /></button>
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                📍 {filters.location}
                <button onClick={clearSearch}><FiX size={10} /></button>
              </span>
            )}
            {filters.company && (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
                🏢 {filters.company}
                <button onClick={clearSearch}><FiX size={10} /></button>
              </span>
            )}
            {filters.jobType && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full capitalize">
                {filters.jobType}
                <button onClick={() => applyFilter('jobType', '')}><FiX size={10} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-44 bg-gray-50" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-lg font-medium">No jobs found</p>
          <p className="text-sm mt-1">Try a different search term or filter</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => <JobCard key={job._id} job={job} />)}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline px-4 py-2 text-sm">← Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {Math.ceil(total / 12)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 12)} className="btn-outline px-4 py-2 text-sm">Next →</button>
        </div>
      )}
    </div>
  );
}
