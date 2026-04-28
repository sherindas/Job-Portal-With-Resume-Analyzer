import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiBriefcase, FiAlertCircle } from 'react-icons/fi';
import PasswordInput from '../../components/PasswordInput';
import { validateEmail } from '../../utils/validate';

export default function RecruiterLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const emailErr = touched.email ? validateEmail(form.email) : '';
  const touch = (f) => setTouched(t => ({ ...t, [f]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setError('');
    const eErr = validateEmail(form.email);
    if (eErr) return setError(eErr);
    if (!form.password) return setError('Password is required');
    setLoading(true);
    try {
      const data = await loginUser({ ...form, role: 'recruiter' });
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card shadow-lg">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-2xl mb-3">
              <FiBriefcase className="text-purple-600" size={26}/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Recruiter Login</h1>
            <p className="text-gray-500 text-sm mt-1">Access your hiring dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3">
                <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            <div>
              <label className="label">Work Email</label>
              <input type="email" className={`input ${emailErr ? 'border-red-400' : ''}`} placeholder="you@company.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                onBlur={() => touch('email')} required/>
              {emailErr && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={11}/> {emailErr}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <PasswordInput placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                onBlur={() => touch('password')} required/>
              {touched.password && !form.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={11}/> Password is required</p>
              )}
            </div>
            <button type="submit" className="btn-purple w-full py-2.5" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In as Recruiter'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            No account? <Link to="/recruiter/register" className="text-purple-600 font-medium hover:underline">Sign up free</Link>
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Looking for a job?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">Job seeker login →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
