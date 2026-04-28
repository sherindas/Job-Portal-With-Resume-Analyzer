import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
    </div>
  );
  if (!user) return <Navigate to={role === 'recruiter' ? '/recruiter/login' : '/login'} replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard'} replace />;
  return children;
}
