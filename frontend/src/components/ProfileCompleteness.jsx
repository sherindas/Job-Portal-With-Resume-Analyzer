import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiCircle, FiArrowRight } from 'react-icons/fi';

const STEPS = [
  { key: 'name',       label: 'Full name',          check: u => !!u?.name },
  { key: 'phone',      label: 'Phone number',        check: u => !!u?.phone },
  { key: 'skills',     label: 'Skills added',        check: u => u?.skills?.length > 0 },
  { key: 'github',     label: 'GitHub / LinkedIn',   check: u => !!(u?.portfolioLinks?.github || u?.portfolioLinks?.linkedin) },
  { key: 'location',   label: 'Job preference set',  check: u => !!u?.jobPreferences?.location },
  { key: 'education',  label: 'Education added',     check: u => u?.education?.length > 0 },
  { key: 'experience', label: 'Experience added',    check: u => u?.experience?.length > 0 },
];

export default function ProfileCompleteness({ user }) {
  const completed = STEPS.filter(s => s.check(user));
  const pct = Math.round((completed.length / STEPS.length) * 100);

  const color = pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : pct >= 30 ? 'bg-yellow-500' : 'bg-red-400';
  const label = pct === 100 ? 'Complete!' : pct >= 60 ? 'Looking good' : pct >= 30 ? 'Getting started' : 'Just started';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Profile Completeness</h3>
        <span className={`text-sm font-bold ${pct === 100 ? 'text-green-600' : pct >= 60 ? 'text-blue-600' : 'text-yellow-600'}`}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500 mb-4">{label} — {completed.length}/{STEPS.length} steps done</p>

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map(step => {
          const done = step.check(user);
          return (
            <div key={step.key} className="flex items-center gap-2.5">
              {done
                ? <FiCheckCircle size={15} className="text-green-500 shrink-0" />
                : <FiCircle size={15} className="text-gray-300 shrink-0" />}
              <span className={`text-sm ${done ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>{step.label}</span>
            </div>
          );
        })}
      </div>

      {pct < 100 && (
        <Link to="/profile"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
          Complete Profile <FiArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
