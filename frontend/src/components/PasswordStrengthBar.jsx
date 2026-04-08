import React from 'react';
import { passwordStrength, strengthLabel } from '../utils/validate';

export default function PasswordStrengthBar({ password }) {
  if (!password) return null;
  const score = passwordStrength(password);
  const { label, color } = strengthLabel(score);

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-gray-200'}`} />
        ))}
      </div>
      {label && (
        <p className={`text-xs font-medium ${
          score === 1 ? 'text-red-500' : score === 2 ? 'text-yellow-600' : score === 3 ? 'text-blue-600' : 'text-green-600'
        }`}>{label} password</p>
      )}
    </div>
  );
}
