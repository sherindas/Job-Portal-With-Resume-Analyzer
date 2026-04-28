import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Job Seeker Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import SavedJobs from './pages/SavedJobs';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CompanyProfile from './pages/CompanyProfile';

import Messages from './pages/Messages';

// Recruiter Pages
import RecruiterLogin from './pages/recruiter/RecruiterLogin';
import RecruiterRegister from './pages/recruiter/RecruiterRegister';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJob from './pages/recruiter/PostJob';
import EditJob from './pages/recruiter/EditJob';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 dark:text-gray-100 transition-colors">
          <ScrollToTop />
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/companies/:id" element={<CompanyProfile />} />

              {/* Job Seeker Protected */}
              <Route path="/dashboard" element={
                <ProtectedRoute role="jobseeker"><Dashboard /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              <Route path="/resume-analyzer" element={
                <ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>
              } />
              <Route path="/saved-jobs" element={
                <ProtectedRoute role="jobseeker"><SavedJobs /></ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute><Messages /></ProtectedRoute>
              } />

              {/* Recruiter Public */}
              <Route path="/recruiter/login" element={<RecruiterLogin />} />
              <Route path="/recruiter/register" element={<RecruiterRegister />} />

              {/* Recruiter Protected */}
              <Route path="/recruiter/dashboard" element={
                <ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>
              } />
              <Route path="/recruiter/post-job" element={
                <ProtectedRoute role="recruiter"><PostJob /></ProtectedRoute>
              } />
              <Route path="/recruiter/edit-job/:id" element={
                <ProtectedRoute role="recruiter"><EditJob /></ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
