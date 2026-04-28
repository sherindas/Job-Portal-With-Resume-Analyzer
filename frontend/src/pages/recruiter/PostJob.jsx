import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../services/api';
import toast from 'react-hot-toast';
import { FiBriefcase } from 'react-icons/fi';

const SKILLS_SUGGESTIONS = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'AWS', 'Docker', 'TypeScript'];

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', location: '', jobType: 'full-time',
    experience: '', salaryMin: '', salaryMax: '', skillsRequired: [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSkill = (s) => {
    const skill = s.trim();
    if (skill && !form.skillsRequired.includes(skill)) {
      set('skillsRequired', [...form.skillsRequired, skill]);
    }
    setSkillInput('');
  };

  const removeSkill = (s) => set('skillsRequired', form.skillsRequired.filter(x => x !== s));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      const payload = {
        ...form,
        salary: { min: Number(form.salaryMin) || 0, max: Number(form.salaryMax) || 0 },
      };
      await createJob(payload);
      toast.success('Job posted successfully!');
      navigate('/recruiter/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <FiBriefcase className="text-purple-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
            <p className="text-gray-500 text-sm">Fill in the details to attract the right candidates</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="label">Job Title *</label>
            <input className="input" placeholder="e.g. Senior React Developer" value={form.title}
              onChange={e => set('title', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Job Type</label>
              <select className="input" value={form.jobType} onChange={e => set('jobType', e.target.value)}>
                {['full-time', 'part-time', 'contract', 'internship', 'remote'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Experience Required</label>
              <select className="input" value={form.experience} onChange={e => set('experience', e.target.value)}>
                <option value="">Any</option>
                {['0-1 years', '1-3 years', '3-5 years', '5-8 years', '8+ years'].map(x => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Location *</label>
            <input className="input" placeholder="e.g. New York, NY or Remote" value={form.location}
              onChange={e => set('location', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min Salary ($/yr)</label>
              <input type="number" className="input" placeholder="60000" value={form.salaryMin}
                onChange={e => set('salaryMin', e.target.value)} />
            </div>
            <div>
              <label className="label">Max Salary ($/yr)</label>
              <input type="number" className="input" placeholder="100000" value={form.salaryMax}
                onChange={e => set('salaryMax', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Required Skills</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" placeholder="Type a skill and press Enter"
                value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} />
              <button type="button" onClick={() => addSkill(skillInput)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 text-sm font-medium">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.skillsRequired.map(s => (
                <span key={s} className="badge bg-purple-100 text-purple-700 flex items-center gap-1">
                  {s} <button type="button" onClick={() => removeSkill(s)} className="ml-1 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS_SUGGESTIONS.filter(s => !form.skillsRequired.includes(s)).map(s => (
                <button key={s} type="button" onClick={() => addSkill(s)}
                  className="text-xs px-2.5 py-1 border border-gray-200 rounded-full text-gray-600 hover:border-purple-400 hover:text-purple-600">
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Job Description *</label>
            <textarea className="input" rows={6}
              placeholder="Describe the role, responsibilities, requirements, and benefits..."
              value={form.description} onChange={e => set('description', e.target.value)} required />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/recruiter/dashboard')}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-purple py-2.5" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
