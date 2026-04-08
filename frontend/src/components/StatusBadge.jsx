import React from 'react';
const MAP = {
  pending:     'bg-yellow-100 text-yellow-700',
  reviewed:    'bg-blue-100 text-blue-700',
  shortlisted: 'bg-purple-100 text-purple-700',
  rejected:    'bg-red-100 text-red-700',
  hired:       'bg-green-100 text-green-700',
  open:        'bg-green-100 text-green-700',
  closed:      'bg-gray-100 text-gray-600',
  draft:       'bg-orange-100 text-orange-700',
};
export default function StatusBadge({ status }) {
  return <span className={`badge capitalize ${MAP[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}
