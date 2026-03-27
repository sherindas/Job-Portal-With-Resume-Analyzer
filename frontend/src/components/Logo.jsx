import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/', size = 'md', variant = 'default' }) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };
  const s = sizes[size] || sizes.md;
  const dark = variant === 'dark'; // white text on dark bg

  return (
    <Link to={to} className="flex items-center gap-2 select-none group">
      {/* Custom J icon mark */}
      <svg width={s.icon} height={s.icon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background pill */}
        <rect width="40" height="40" rx="12" fill="url(#jobly-grad)" />
        {/* Briefcase body */}
        <rect x="9" y="17" width="22" height="15" rx="3" fill="white" opacity="0.95" />
        {/* Briefcase handle */}
        <path d="M15 17V15C15 13.343 16.343 12 18 12H22C23.657 12 25 13.343 25 15V17" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {/* Center divider */}
        <rect x="19" y="17" width="2" height="15" rx="1" fill="url(#jobly-grad)" opacity="0.4" />
        {/* Latch */}
        <rect x="17" y="23" width="6" height="3" rx="1.5" fill="url(#jobly-grad)" />
        <defs>
          <linearGradient id="jobly-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      <span className={`${s.text} font-extrabold tracking-tight leading-none`}>
        <span className={dark ? 'text-white' : 'text-indigo-600'}>Job</span>
        <span className={dark ? 'text-blue-300' : 'text-blue-500'}>ly</span>
      </span>
    </Link>
  );
}
