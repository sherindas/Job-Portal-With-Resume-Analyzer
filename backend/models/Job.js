const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  skillsRequired: [String],
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
  },
  experience: { type: String, default: '' },
  location: { type: String, required: true },
  jobType:  { type: String, enum: ['full-time','part-time','remote','contract','internship'], default: 'full-time' },
  status:   { type: String, enum: ['open','closed','draft'], default: 'open' },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  views: { type: Number, default: 0 },
  deadline: { type: Date },
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);
