import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';
import { FiSearch, FiMapPin, FiFilter, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const JOB_TYPES = ['', 'full-time', 'part-time', 'remote', 'contract', 'internship'];

const COMMON_ROLES = [
  'Software Engineer', 'Software Developer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Full Stack Engineer', 'React Developer', 'Node.js Developer',
  'Python Developer', 'Java Developer', 'Android Developer', 'iOS Developer',
  'Mobile Developer', 'DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer',
  'Data Scientist', 'Data Analyst', 'Data Engineer', 'Machine Learning Engineer',
  'AI Engineer', 'Deep Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer',
  'UI/UX Designer', 'Product Designer', 'Graphic Designer', 'Web Designer',
  'Product Manager', 'Project Manager', 'Scrum Master', 'Agile Coach',
  'QA Engineer', 'Test Engineer', 'Automation Engineer', 'Security Engineer',
  'Cybersecurity Analyst', 'Network Engineer', 'System Administrator', 'Database Administrator',
  'Business Analyst', 'Technical Lead', 'Engineering Manager', 'CTO',
  'Solutions Architect', 'Cloud Architect', 'Technical Writer', 'Support Engineer',
  'Embedded Systems Engineer', 'Firmware Engineer', 'Blockchain Developer',
  'Game Developer', 'AR/VR Developer', 'Salesforce Developer', 'SAP Consultant',
];

const COMMON_SKILLS = [
  'React', 'React Native', 'Next.js', 'Angular', 'Vue.js',
  'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'FastAPI',
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'SQL', 'NoSQL',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
  'Data Science', 'Pandas', 'NumPy', 'Scikit-learn', 'Power BI', 'Tableau',
  'Flutter', 'Android', 'iOS', 'Figma', 'Tailwind CSS', 'GraphQL', 'REST API',
  'Git', 'Linux', 'Bash', 'Microservices', 'Agile', 'Scrum', 'DevOps',
];

const COMMON_LOCATIONS = [
  // Remote
  'Remote', 'Hybrid', 'Work from Home',
  // India
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
  'Ahmedabad', 'Jaipur', 'Noida', 'Gurgaon', 'Kochi', 'Chandigarh', 'Indore',
  // USA
  'New York', 'San Francisco', 'Seattle', 'Austin', 'Chicago', 'Los Angeles',
  'Boston', 'Denver', 'Atlanta', 'Dallas', 'Miami', 'Washington DC',
  // Europe
  'London', 'Berlin', 'Amsterdam', 'Paris', 'Dublin', 'Stockholm', 'Zurich',
  'Barcelona', 'Munich', 'Warsaw', 'Lisbon',
  // Asia Pacific
  'Singapore', 'Toronto', 'Sydney', 'Melbourne', 'Tokyo', 'Dubai', 'Hong Kong',
];

function SuggestionsDropdown({ suggestions, onSelect, visible }) {
  if (!visible || suggestions.length === 0) return null;
  return (
    <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
      {suggestions.map((s, i) => (
        <li key={i}>
          <button type="button" onMouseDown={() => onSelect(s.value)}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between gap-2 transition-colors">
            <span className="flex items-center gap-2">
              <FiSearch size={12} className="text-gray-400 shrink-0" />
              {s.value}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
              s.type === 'role'   ? 'bg-purple-100 text-purple-600' :
              s.type === 'skill'  ? 'bg-blue-100 text-blue-600' :
              s.type === 'remote' ? 'bg-green-100 text-green-600' :
              s.type === 'city'   ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-500'
            }`}>{s.type}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function Jobs() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Applied filters — only change when user picks suggestion or clicks Search
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    jobType: '',
    sort: 'newest',
  });

  // Input values — change on every keystroke, drive suggestions only
  const [keywordInput, setKeywordInput] = useState(searchParams.get('keyword') || '');
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');

  // Suggestions state
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showKeyword, setShowKeyword] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const keywordRef = useRef();
  const locationRef = useRef();

  // Accumulate job titles + locations from API results for richer suggestions
  const [jobTitles, setJobTitles] = useState([]);
  const [jobLocations, setJobLocations] = useState([]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.location) params.location = filters.location;
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.sort === 'salary') params.sort = 'salary';
      const { data } = await getJobs(params);
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      const titles = (data.jobs || []).map(j => j.title).filter(Boolean);
      const locs = (data.jobs || []).map(j => j.location).filter(Boolean);
      setJobTitles(prev => [...new Set([...prev, ...titles])]);
      setJobLocations(prev => [...new Set([...prev, ...locs])]);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Suggestions update on input change — no API call
  useEffect(() => {
    const q = keywordInput.trim().toLowerCase();
    if (!q) { setKeywordSuggestions([]); return; }

    const roleMatches = COMMON_ROLES
      .filter(s => s.toLowerCase().includes(q))
      .map(s => ({ value: s, type: 'role' }));

    const skillMatches = COMMON_SKILLS
      .filter(s => s.toLowerCase().includes(q))
      .map(s => ({ value: s, type: 'skill' }));

    const titleMatches = jobTitles
      .filter(s => s.toLowerCase().includes(q) && !COMMON_ROLES.includes(s))
      .map(s => ({ value: s, type: 'job' }));

    // Roles first, then skills, then live job titles — dedupe by value
    const seen = new Set();
    const merged = [...roleMatches, ...skillMatches, ...titleMatches].filter(s => {
      if (seen.has(s.value.toLowerCase())) return false;
      seen.add(s.value.toLowerCase());
      return true;
    }).slice(0, 10);

    setKeywordSuggestions(merged);
  }, [keywordInput, jobTitles]);

  useEffect(() => {
    const q = locationInput.trim().toLowerCase();
    if (!q) { setLocationSuggestions([]); return; }

    const staticMatches = COMMON_LOCATIONS
      .filter(l => l.toLowerCase().includes(q))
      .map(l => ({ value: l, type: l === 'Remote' || l === 'Hybrid' || l === 'Work from Home' ? 'remote' : 'city' }));

    const liveMatches = jobLocations
      .filter(l => l.toLowerCase().includes(q) && !COMMON_LOCATIONS.map(c => c.toLowerCase()).includes(l.toLowerCase()))
      .map(l => ({ value: l, type: 'job' }));

    const seen = new Set();
    const merged = [...staticMatches, ...liveMatches].filter(s => {
      if (seen.has(s.value.toLowerCase())) return false;
      seen.add(s.value.toLowerCase());
      return true;
    }).slice(0, 8);

    setLocationSuggestions(merged);
  }, [locationInput, jobLocations]);

  // Only fires on Search button or Enter — guard against empty input
  const applySearch = () => {
    const kw = keywordInput.trim();
    const loc = locationInput.trim();
    // If both empty and no jobType filter, do nothing
    if (!kw && !loc && !filters.jobType) return;
    setFilters(f => ({ ...f, keyword: kw, location: loc }));
    setPage(1);
    setShowKeyword(false);
    setShowLocation(false);
  };

  const applyFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1); };

  // Picking a suggestion commits it immediately and searches
  const selectKeyword = (val) => {
    setKeywordInput(val);
    setFilters(f => ({ ...f, keyword: val }));
    setPage(1);
    setShowKeyword(false);
  };
  const selectLocation = (val) => {
    setLocationInput(val);
    setFilters(f => ({ ...f, location: val }));
    setPage(1);
    setShowLocation(false);
  };

  const clearKeyword = () => {
    setKeywordInput('');
    setFilters(f => ({ ...f, keyword: '' }));
    setShowKeyword(false);
  };
  const clearLocation = () => {
    setLocationInput('');
    setFilters(f => ({ ...f, location: '' }));
    setShowLocation(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 text-sm mt-1">{total} opportunities available</p>
      </div>

      {/* Search & Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-3 mb-4">

          {/* Keyword search with suggestions */}
          <div className="relative flex-1" ref={keywordRef}>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
              <FiSearch className="text-gray-400 shrink-0" size={16} />
              <input
                className="flex-1 outline-none text-sm py-2.5 bg-transparent"
                placeholder="Job title, skills, keyword..."
                value={keywordInput}
                onChange={e => { setKeywordInput(e.target.value); setShowKeyword(true); }}
                onFocus={() => setShowKeyword(true)}
                onBlur={() => setTimeout(() => setShowKeyword(false), 150)}
                onKeyDown={e => e.key === 'Enter' && applySearch()}
              />
              {keywordInput && (
                <button type="button" onClick={clearKeyword} className="text-gray-400 hover:text-gray-600">
                  <FiX size={14} />
                </button>
              )}
            </div>
            <SuggestionsDropdown
              suggestions={keywordSuggestions}
              onSelect={selectKeyword}
              visible={showKeyword}
            />
          </div>

          {/* Location search with suggestions */}
          <div className="relative flex-1" ref={locationRef}>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
              <FiMapPin className="text-gray-400 shrink-0" size={16} />
              <input
                className="flex-1 outline-none text-sm py-2.5 bg-transparent"
                placeholder="Location..."
                value={locationInput}
                onChange={e => { setLocationInput(e.target.value); setShowLocation(true); }}
                onFocus={() => setShowLocation(true)}
                onBlur={() => setTimeout(() => setShowLocation(false), 150)}
                onKeyDown={e => e.key === 'Enter' && applySearch()}
              />
              {locationInput && (
                <button type="button" onClick={clearLocation} className="text-gray-400 hover:text-gray-600">
                  <FiX size={14} />
                </button>
              )}
            </div>
            <SuggestionsDropdown
              suggestions={locationSuggestions}
              onSelect={selectLocation}
              visible={showLocation}
            />
          </div>

          <button onClick={applySearch}
            disabled={!keywordInput.trim() && !locationInput.trim()}
            className="btn-primary px-6 disabled:opacity-40 disabled:cursor-not-allowed">
            Search
          </button>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-2 items-center">
          <FiFilter size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400 mr-1">Filter:</span>
          {JOB_TYPES.map(t => (
            <button key={t} onClick={() => applyFilter('jobType', t)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors capitalize
                ${filters.jobType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t || 'All Types'}
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

        {/* Active filters chips */}
        {(filters.keyword || filters.location || filters.jobType) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Active:</span>
            {filters.keyword && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                "{filters.keyword}" <button onClick={clearKeyword}><FiX size={10} /></button>
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                📍 {filters.location} <button onClick={clearLocation}><FiX size={10} /></button>
              </span>
            )}
            {filters.jobType && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full capitalize">
                {filters.jobType} <button onClick={() => applyFilter('jobType', '')}><FiX size={10} /></button>
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
          <p className="text-sm mt-1">Try different keywords or filters</p>
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
