import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { saveCompany } from '../../services/api';
import toast from 'react-hot-toast';
import { FiBriefcase, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import PasswordInput from '../../components/PasswordInput';
import PasswordStrengthBar from '../../components/PasswordStrengthBar';
import { validateEmail, validatePassword } from '../../utils/validate';
import { FiAlertCircle } from 'react-icons/fi';

export default function RecruiterRegister() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [account, setAccount] = useState({ name: '', email: '', password: '', confirm: '' });
  const [company, setCompany] = useState({ name: '', description: '', industry: '', location: '', website: '' });

  const handleStep1 = (e) => {
    e.preventDefault();
    const eErr = validateEmail(account.email);
    if (eErr) return toast.error(eErr);
    const pErr = validatePassword(account.password);
    if (pErr) return toast.error(pErr);
    if (account.password !== account.confirm) return toast.error('Passwords do not match');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser({ name: account.name, email: account.email, password: account.password, role: 'recruiter' });
      await saveCompany(company);
      toast.success('Account created! Welcome aboard.');
      navigate('/recruiter/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-2xl mb-3">
              <FiBriefcase className="text-purple-600" size={26} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Recruiter Sign Up</h1>
            <p className="text-gray-500 text-sm mt-1">Step {step} of 2 — {step === 1 ? 'Account Details' : 'Company Profile'}</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-purple-500' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-gray-200'}`} />
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Jane Smith" value={account.name}
                  onChange={e => setAccount({ ...account, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Work Email</label>
                <input type="email" className="input" placeholder="you@company.com" value={account.email}
                  onChange={e => setAccount({ ...account, email: e.target.value })} required />
              </div>
              <div>
                <label className="label">Password</label>
                <PasswordInput placeholder="Min 8 chars, uppercase, number, symbol" value={account.password}
                  onChange={e => setAccount({ ...account, password: e.target.value })} required />
                <PasswordStrengthBar password={account.password} />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <PasswordInput placeholder="Repeat password" value={account.confirm}
                  onChange={e => setAccount({ ...account, confirm: e.target.value })} required />
                {account.confirm && account.password !== account.confirm && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiAlertCircle size={11} /> Passwords do not match
                  </p>
                )}
              </div>
              <button type="submit" className="btn-purple w-full py-2.5 flex items-center justify-center gap-2">
                Next <FiArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Company Name</label>
                <input className="input" placeholder="Acme Corp" value={company.name}
                  onChange={e => setCompany({ ...company, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Industry</label>
                <select className="input" value={company.industry}
                  onChange={e => setCompany({ ...company, industry: e.target.value })} required>
                  <option value="">Select industry</option>
                  {['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Other'].map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" placeholder="New York, NY" value={company.location}
                  onChange={e => setCompany({ ...company, location: e.target.value })} required />
              </div>
              <div>
                <label className="label">Website (optional)</label>
                <input className="input" placeholder="https://company.com" value={company.website}
                  onChange={e => setCompany({ ...company, website: e.target.value })} />
              </div>
              <div>
                <label className="label">Company Description</label>
                <textarea className="input" rows={3} placeholder="Brief description of your company..."
                  value={company.description} onChange={e => setCompany({ ...company, description: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                  <FiArrowLeft size={16} /> Back
                </button>
                <button type="submit" className="flex-1 btn-purple py-2.5" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account? <Link to="/recruiter/login" className="text-purple-600 font-medium hover:underline">Sign in</Link>
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Looking for a job?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">Job seeker sign up →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
