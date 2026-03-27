import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiTarget, FiBookmark, FiMessageCircle } from 'react-icons/fi';
import NotificationBell from './NotificationBell';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isRecruiter = user?.role === 'recruiter';

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Logo to={isRecruiter ? '/recruiter/dashboard' : '/'} size="sm" />
          {isRecruiter && <span className="badge bg-purple-100 text-purple-700 text-xs ml-1">Recruiter</span>}
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5">
          {!isRecruiter && <Link to="/jobs" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Browse Jobs</Link>}
          {user && !isRecruiter && <Link to="/resume-analyzer" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Resume Analyzer</Link>}
          {user && !isRecruiter && <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>}
          {isRecruiter && <Link to="/recruiter/dashboard" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">Dashboard</Link>}
          {isRecruiter && <Link to="/recruiter/post-job" className="btn-purple text-sm py-1.5 px-4">+ Post Job</Link>}

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${isRecruiter ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FiUser size={14}/> Profile</Link>
                  {!isRecruiter && <Link to="/resume-analyzer" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FiTarget size={14}/> Resume Analyzer</Link>}
                  {!isRecruiter && <Link to="/saved-jobs" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FiBookmark size={14}/> Saved Jobs</Link>}
                  {user && <Link to="/messages" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FiMessageCircle size={14}/> Messages</Link>}
                  {!isRecruiter && <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FiGrid size={14}/> Dashboard</Link>}
                  {isRecruiter && <Link to="/recruiter/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FiGrid size={14}/> Dashboard</Link>}
                  <hr className="my-1 border-gray-100"/>
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"><FiLogOut size={14}/> Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-outline text-sm py-1.5 px-4">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Sign Up</Link>
              <div className="w-px h-5 bg-gray-200"/>
              <Link to="/recruiter/login" className="text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-200 rounded-lg py-1.5 px-4 hover:bg-purple-50 transition-colors">Recruiter</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-gray-500" onClick={() => setOpen(!open)}>
          {open ? <FiX size={22}/> : <FiMenu size={22}/>}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {!isRecruiter && <Link to="/jobs" className="block py-2 text-gray-700 font-medium" onClick={() => setOpen(false)}>Browse Jobs</Link>}
          {user && !isRecruiter && <Link to="/resume-analyzer" className="block py-2 text-gray-700 font-medium" onClick={() => setOpen(false)}>Resume Analyzer</Link>}
          {user && !isRecruiter && <Link to="/dashboard" className="block py-2 text-gray-700 font-medium" onClick={() => setOpen(false)}>Dashboard</Link>}
          {isRecruiter && <Link to="/recruiter/dashboard" className="block py-2 text-purple-600 font-medium" onClick={() => setOpen(false)}>Dashboard</Link>}
          {isRecruiter && <Link to="/recruiter/post-job" className="block py-2 text-purple-600 font-medium" onClick={() => setOpen(false)}>+ Post Job</Link>}
          {user && <Link to="/profile" className="block py-2 text-gray-700" onClick={() => setOpen(false)}>Profile</Link>}
          {user ? (
            <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 font-medium">Logout</button>
          ) : (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Link to="/login" className="block py-2 text-blue-600 font-medium" onClick={() => setOpen(false)}>Job Seeker Login</Link>
              <Link to="/register" className="block py-2 text-blue-600" onClick={() => setOpen(false)}>Job Seeker Sign Up</Link>
              <Link to="/recruiter/login" className="block py-2 text-purple-600 font-medium" onClick={() => setOpen(false)}>Recruiter Login</Link>
              <Link to="/recruiter/register" className="block py-2 text-purple-600" onClick={() => setOpen(false)}>Recruiter Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
