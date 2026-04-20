import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    skills: user?.skills?.join(', ') || '',
    portfolioLinks: {
      github: user?.portfolioLinks?.github || '',
      linkedin: user?.portfolioLinks?.linkedin || '',
      portfolio: user?.portfolioLinks?.portfolio || '',
    },
    jobPreferences: {
      location: user?.jobPreferences?.location || '',
      expectedSalary: user?.jobPreferences?.expectedSalary || '',
      jobType: user?.jobPreferences?.jobType || '',
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
      const { data } = await updateProfile(payload);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Basic Info</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}/></div>
            <div className="md:col-span-2"><label className="label">Email</label><input className="input bg-gray-50" value={user?.email} disabled/></div>
          </div>
        </div>

        {user?.role === 'jobseeker' && (
          <>
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-3">Skills</h2>
              <input className="input" placeholder="React, Node.js, Python, MongoDB..." value={form.skills}
                onChange={e => setForm({...form, skills: e.target.value})}/>
              <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
            </div>

            <div className="card space-y-3">
              <h2 className="font-semibold text-gray-800">Portfolio Links</h2>
              {['github','linkedin','portfolio'].map(k => (
                <div key={k}>
                  <label className="label capitalize">{k}</label>
                  <input className="input" placeholder={`https://${k}.com/...`}
                    value={form.portfolioLinks[k]}
                    onChange={e => setForm({...form, portfolioLinks: {...form.portfolioLinks, [k]: e.target.value}})}/>
                </div>
              ))}
            </div>

            <div className="card space-y-3">
              <h2 className="font-semibold text-gray-800">Job Preferences</h2>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="label">Preferred Location</label>
                  <input className="input" value={form.jobPreferences.location}
                    onChange={e => setForm({...form, jobPreferences: {...form.jobPreferences, location: e.target.value}})}/>
                </div>
                <div>
                  <label className="label">Expected Salary (₹)</label>
                  <input type="number" className="input" value={form.jobPreferences.expectedSalary}
                    onChange={e => setForm({...form, jobPreferences: {...form.jobPreferences, expectedSalary: e.target.value}})}/>
                </div>
                <div>
                  <label className="label">Job Type</label>
                  <select className="input" value={form.jobPreferences.jobType}
                    onChange={e => setForm({...form, jobPreferences: {...form.jobPreferences, jobType: e.target.value}})}>
                    <option value="">Any</option>
                    {['full-time','part-time','remote','contract','internship'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        <button type="submit" className="btn-primary px-8 py-2.5" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
