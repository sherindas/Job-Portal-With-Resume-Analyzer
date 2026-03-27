import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiSearch, FiMapPin, FiArrowRight, FiBriefcase,
  FiUsers, FiCheckCircle, FiTrendingUp, FiStar
} from 'react-icons/fi';

const CATEGORIES = [
  {
    label: 'Technology',
    count: '1,240 jobs',
    keyword: 'Technology',
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <rect x="4" y="8" width="40" height="28" rx="3" fill="#3b82f6" />
        <rect x="7" y="11" width="34" height="22" rx="2" fill="#dbeafe" />
        <rect x="16" y="36" width="16" height="3" rx="1" fill="#93c5fd" />
        <rect x="12" y="39" width="24" height="2" rx="1" fill="#60a5fa" />
        <circle cx="24" cy="22" r="5" fill="#2563eb" />
        <path d="M20 22 L22 24 L28 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    label: 'Finance',
    count: '860 jobs',
    keyword: 'Finance',
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <rect x="4" y="28" width="8" height="16" rx="2" fill="#22c55e" />
        <rect x="14" y="20" width="8" height="24" rx="2" fill="#16a34a" />
        <rect x="24" y="12" width="8" height="32" rx="2" fill="#15803d" />
        <rect x="34" y="6" width="8" height="38" rx="2" fill="#166534" />
        <path d="M8 26 L18 18 L28 10 L38 4" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="38" cy="4" r="3" fill="#4ade80" />
      </svg>
    ),
  },
  {
    label: 'Healthcare',
    count: '720 jobs',
    keyword: 'Healthcare',
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <rect x="6" y="6" width="36" height="36" rx="6" fill="#fee2e2" />
        <rect x="20" y="12" width="8" height="24" rx="3" fill="#ef4444" />
        <rect x="12" y="20" width="24" height="8" rx="3" fill="#ef4444" />
        <circle cx="24" cy="24" r="3" fill="white" />
      </svg>
    ),
  },
  {
    label: 'Design',
    count: '540 jobs',
    keyword: 'Design',
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <circle cx="24" cy="24" r="18" fill="#fdf4ff" />
        <circle cx="16" cy="18" r="5" fill="#a855f7" />
        <circle cx="32" cy="18" r="5" fill="#ec4899" />
        <circle cx="16" cy="32" r="5" fill="#f97316" />
        <circle cx="32" cy="32" r="5" fill="#3b82f6" />
        <circle cx="24" cy="24" r="4" fill="white" stroke="#d8b4fe" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Marketing',
    count: '430 jobs',
    keyword: 'Marketing',
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <path d="M8 20 L36 8 L36 40 L8 28 Z" fill="#f97316" rx="2" />
        <rect x="4" y="20" width="6" height="8" rx="1" fill="#ea580c" />
        <rect x="36" y="18" width="6" height="5" rx="2" fill="#fb923c" />
        <path d="M10 28 L14 38" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="12" r="4" fill="#fbbf24" />
        <path d="M38 10 L42 14 M42 10 L38 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Engineering',
    count: '980 jobs',
    keyword: 'Engineering',
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <circle cx="24" cy="24" r="10" fill="none" stroke="#64748b" strokeWidth="3" />
        <circle cx="24" cy="24" r="4" fill="#3b82f6" />
        {[0,60,120,180,240,300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 24 + 10 * Math.cos(rad);
          const y1 = 24 + 10 * Math.sin(rad);
          const x2 = 24 + 18 * Math.cos(rad);
          const y2 = 24 + 18 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />;
        })}
        <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    ),
  },
  {
    label: 'Education',
    count: '310 jobs',
    keyword: 'Education',
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <path d="M24 8 L44 18 L24 28 L4 18 Z" fill="#8b5cf6" />
        <path d="M12 23 L12 35 C12 35 18 40 24 40 C30 40 36 35 36 35 L36 23" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
        <rect x="40" y="18" width="3" height="14" rx="1.5" fill="#a78bfa" />
        <circle cx="41.5" cy="34" r="2.5" fill="#7c3aed" />
      </svg>
    ),
  },
  {
    label: 'Legal',
    count: '190 jobs',
    keyword: 'Legal',
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <rect x="22" y="4" width="4" height="40" rx="2" fill="#92400e" />
        <rect x="10" y="8" width="28" height="3" rx="1.5" fill="#b45309" />
        <line x1="10" y1="9.5" x2="4" y2="22" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="38" y1="9.5" x2="44" y2="22" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="7" cy="23" rx="5" ry="2.5" fill="#fbbf24" />
        <ellipse cx="41" cy="23" rx="5" ry="2.5" fill="#fbbf24" />
        <rect x="14" y="40" width="20" height="3" rx="1.5" fill="#92400e" />
      </svg>
    ),
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer at TechCorp',
    text: 'Found my dream job within two weeks. The application tracking made the whole process stress-free.',
    avatar: 'PS',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Rahul Mehta',
    role: 'Product Manager at StartupX',
    text: 'The job recommendations were spot on. I got shortlisted for roles that actually matched my skills.',
    avatar: 'RM',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'Ananya Nair',
    role: 'UX Designer at DesignHub',
    text: 'Simple, clean, and effective. I appreciated how easy it was to upload my resume and apply.',
    avatar: 'AN',
    color: 'bg-green-100 text-green-700',
  },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        {/* Glowing orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-purple-500 rounded-full opacity-10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <FiTrendingUp size={12} /> 10,000+ new jobs added this month
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Find Work That <br />
              <span className="text-blue-400">Fits Your Life</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
              Connect with companies that value your skills. Browse real opportunities, apply in minutes, and take the next step in your career.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch}
              className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl max-w-2xl">
              <div className="flex items-center gap-2 flex-1 px-3">
                <FiSearch className="text-gray-400 shrink-0" size={17} />
                <input className="flex-1 outline-none text-gray-800 text-sm py-2.5 placeholder-gray-400"
                  placeholder="Job title or keyword..."
                  value={keyword} onChange={e => setKeyword(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 flex-1 px-3 border-t md:border-t-0 md:border-l border-gray-100">
                <FiMapPin className="text-gray-400 shrink-0" size={17} />
                <input className="flex-1 outline-none text-gray-800 text-sm py-2.5 placeholder-gray-400"
                  placeholder="City or remote..."
                  value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <button type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-2.5 rounded-xl text-sm transition-colors shrink-0">
                Search Jobs
              </button>
            </form>

            <p className="text-slate-400 text-sm mt-4">
              Popular: <button onClick={() => navigate('/jobs?keyword=React')} className="text-blue-400 hover:underline mr-2">React</button>
              <button onClick={() => navigate('/jobs?keyword=Python')} className="text-blue-400 hover:underline mr-2">Python</button>
              <button onClick={() => navigate('/jobs?keyword=Product+Manager')} className="text-blue-400 hover:underline mr-2">Product Manager</button>
              <button onClick={() => navigate('/jobs?jobType=remote')} className="text-blue-400 hover:underline">Remote</button>
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: '10K+', l: 'Jobs Posted', icon: FiBriefcase },
            { n: '5K+',  l: 'Companies',   icon: FiUsers },
            { n: '50K+', l: 'Job Seekers', icon: FiTrendingUp },
            { n: '92%',  l: 'Hired Within 60 Days', icon: FiCheckCircle },
          ].map(({ n, l, icon: Icon }) => (
            <div key={l} className="flex flex-col items-center gap-1">
              <Icon size={22} className="text-blue-200 mb-1" />
              <div className="text-3xl font-extrabold text-white">{n}</div>
              <div className="text-xs text-blue-200">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Browse by Category ── */}
      <section className="py-20 px-4 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-100 rounded-full opacity-50 blur-3xl" />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-blue-600 text-sm font-semibold mb-1 uppercase tracking-wide">Explore</p>
              <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            </div>
            <Link to="/jobs" className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
              View all jobs <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            {CATEGORIES.map(cat => (
              <Link key={cat.label} to={`/jobs?keyword=${cat.keyword}`}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-center flex flex-col items-center shadow-sm">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-200">
                  {cat.icon}
                </div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">{cat.label}</p>
                <p className="text-xs text-gray-400 mt-1">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden relative">
        <div className="absolute top-10 right-10 w-48 h-48 bg-blue-100 rounded-full opacity-60 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-purple-100 rounded-full opacity-60 blur-3xl" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">Simple Process</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-md mx-auto">Three steps to your next job. No complicated process, no hidden fees.</p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200" style={{left:'18%', right:'18%'}} />

            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                      <circle cx="16" cy="10" r="5" fill="white" />
                      <path d="M6 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="24" cy="8" r="4" fill="#93c5fd" />
                      <path d="M22 8h4M24 6v4" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center text-xs font-black text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Profile</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Sign up and build your professional profile with your skills, experience, and job preferences.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Skills', 'Experience', 'Resume'].map(tag => (
                    <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group md:mt-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
                    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                      <rect x="4" y="6" width="24" height="20" rx="3" fill="white" opacity="0.3" />
                      <rect x="4" y="6" width="24" height="20" rx="3" stroke="white" strokeWidth="2" />
                      <line x1="9" y1="12" x2="23" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <line x1="9" y1="17" x2="19" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="25" cy="23" r="5" fill="#a78bfa" />
                      <path d="M23 23l1.5 1.5L27 21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-purple-200 rounded-full flex items-center justify-center text-xs font-black text-purple-600">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Browse & Apply</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Search thousands of jobs, filter by location and role, and apply with a single click.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Search', 'Filter', 'One-click Apply'].map(tag => (
                    <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 border border-green-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
                    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                      <circle cx="16" cy="16" r="11" stroke="white" strokeWidth="2" />
                      <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="26" cy="8" r="4" fill="#86efac" />
                      <path d="M24.5 8h3M26 6.5v3" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-green-200 rounded-full flex items-center justify-center text-xs font-black text-green-600">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Get Hired</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Track your applications, chat with recruiters, and land your next opportunity.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Track', 'Chat', 'Offer'].map(tag => (
                    <span key={tag} className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="absolute -top-20 right-0 w-72 h-72 bg-blue-800 rounded-full opacity-20 blur-3xl" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block bg-white/10 text-blue-300 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">Success Stories</span>
            <h2 className="text-3xl font-bold text-white">People Who Found Their Jobs Here</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1 duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <FiStar key={i} size={14} className="text-yellow-400 fill-current" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.color}`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dual CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-blue-100 rounded-full opacity-60 blur-3xl" />
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Job Seeker */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl p-10">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full" />
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
                <FiBriefcase size={22} />
              </div>
              <h2 className="text-2xl font-bold mb-3">Looking for Work?</h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-7">
                Browse thousands of openings across every industry. Create a free profile and start applying today.
              </p>
              <ul className="space-y-2 mb-8">
                {['Free to join', 'Apply in one click', 'Track all applications'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-blue-100">
                    <FiCheckCircle size={14} className="text-blue-300 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to={user?.role === 'jobseeker' ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold py-3 px-7 rounded-xl hover:bg-blue-50 transition-colors text-sm">
                {user?.role === 'jobseeker' ? 'Go to Dashboard' : 'Create Free Account'} <FiArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Recruiter */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-3xl p-10">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full" />
            <div className="relative">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                <FiUsers size={22} />
              </div>
              <h2 className="text-2xl font-bold mb-3">Hiring Talent?</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-7">
                Post jobs, review applications, and connect with qualified candidates. Find the right person faster.
              </p>
              <ul className="space-y-2 mb-8">
                {['Post unlimited jobs', 'Review applicants easily', 'Message candidates directly'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <FiCheckCircle size={14} className="text-slate-400 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/recruiter/register'}
                className="inline-flex items-center gap-2 bg-white text-slate-800 font-semibold py-3 px-7 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                {user?.role === 'recruiter' ? 'Go to Dashboard' : 'Start Hiring Free'} <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-16 px-4 text-white text-center">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Ready to take the next step?</h2>
          <p className="text-blue-100 mb-8">Join thousands of professionals who found their next opportunity on Jobly.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/jobs" className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-xl hover:bg-blue-50 transition-colors text-sm">
              Browse Jobs
            </Link>
            <Link to="/register" className="border border-white/40 text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/10 transition-colors text-sm">
              Create Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
