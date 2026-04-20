import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import { validatePassword } from '../utils/validate';
import { FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const pErr = validatePassword(form.password);
    if (pErr) return setError(pErr);
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await resetPassword(token, { password: form.password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card shadow-lg">
          {done ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                <FiCheckCircle className="text-green-600" size={30} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
              <p className="text-gray-500 text-sm">Redirecting you to login...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-3">
                  <FiLock className="text-blue-600" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
                <p className="text-gray-500 text-sm mt-1">Choose a strong password for your account</p>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 mb-4">
                  <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <PasswordInput placeholder="Min 8 chars, uppercase, number, symbol" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <PasswordStrengthBar password={form.password} />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <PasswordInput placeholder="Repeat new password" value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                  {form.confirm && form.password !== form.confirm && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <FiAlertCircle size={12} /> Passwords do not match
                    </p>
                  )}
                </div>
                <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-5">
                Remember it? <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
