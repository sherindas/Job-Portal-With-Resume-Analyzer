import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiBriefcase, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import { validateEmail, validatePassword } from '../utils/validate';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'jobseeker' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const emailErr   = touched.email    ? validateEmail(form.email)       : '';
  const passErr    = touched.password ? validatePassword(form.password)  : '';
  const confirmErr = touched.confirm  && form.confirm && form.password !== form.confirm ? 'Passwords do not match' : '';

  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true, confirm: true, name: true });
    setError('');

    if (!form.name.trim()) return setError('Full name is required');
    const eErr = validateEmail(form.email);
    if (eErr) return setError(eErr);
    const pErr = validatePassword(form.password);
    if (pErr) return setError(pErr);
    if (form.password !== form.confirm) return setError('Passwords do not match');

    setLoading(true);
    try {
      const data = await registerUser({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate(data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const Field = ({ label, error, ok, children }) => (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <FiAlertCircle size={11} /> {error}
        </p>
      )}
      {ok && !error && (
        <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
          <FiCheckCircle size={11} /> Looks good
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card shadow-lg">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-3">
              <FiUser className="text-blue-600" size={26} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join thousands of professionals</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[{ r: 'jobseeker', icon: <FiUser />, label: 'Job Seeker' }, { r: 'recruiter', icon: <FiBriefcase />, label: 'Recruiter' }].map(({ r, icon, label }) => (
              <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all
                  ${form.role === r
                    ? (r === 'recruiter' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-blue-500 bg-blue-50 text-blue-700')
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {icon} {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 mb-4">
              <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" error={touched.name && !form.name.trim() ? 'Name is required' : ''} ok={!!form.name.trim()}>
              <input className="input" placeholder="John Doe" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onBlur={() => touch('name')} />
            </Field>

            <Field label="Email" error={emailErr} ok={!emailErr && !!form.email}>
              <input type="email" className={`input ${emailErr ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onBlur={() => touch('email')} />
            </Field>

            <div>
              <label className="label">Password</label>
              <PasswordInput placeholder="Min 8 chars, uppercase, number, symbol" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onBlur={() => touch('password')} />
              <PasswordStrengthBar password={form.password} />
              {passErr && touched.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={11} /> {passErr}
                </p>
              )}
            </div>

            <Field label="Confirm Password" error={confirmErr} ok={!confirmErr && !!form.confirm && form.password === form.confirm}>
              <PasswordInput placeholder="Repeat your password" value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                onBlur={() => touch('confirm')} />
            </Field>

            {/* Password rules hint */}
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-600 mb-1.5">Password must contain:</p>
              {[
                { rule: /.{8,}/, text: 'At least 8 characters' },
                { rule: /[A-Z]/, text: 'One uppercase letter (A-Z)' },
                { rule: /[a-z]/, text: 'One lowercase letter (a-z)' },
                { rule: /[0-9]/, text: 'One number (0-9)' },
                { rule: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, text: 'One special character (!@#$...)' },
              ].map(({ rule, text }) => (
                <div key={text} className={`flex items-center gap-1.5 ${rule.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                  <FiCheckCircle size={11} className={rule.test(form.password) ? 'text-green-500' : 'text-gray-300'} />
                  {text}
                </div>
              ))}
            </div>

            <button type="submit"
              className={`w-full py-2.5 ${form.role === 'recruiter' ? 'btn-purple' : 'btn-primary'}`}
              disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
