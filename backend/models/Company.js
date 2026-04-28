const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  recruiter:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  industry:    { type: String, default: '' },
  location:    { type: String, default: '' },
  website:     { type: String, default: '' },
  size:        { type: String, default: '' },
  logo:        { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
