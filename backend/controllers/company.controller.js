const Company = require('../models/Company');
const User = require('../models/User');

exports.createOrUpdate = async (req, res) => {
  try {
    let company = await Company.findOne({ recruiter: req.user.id });
    if (company) {
      company = await Company.findByIdAndUpdate(company._id, req.body, { new: true });
    } else {
      company = await Company.create({ ...req.body, recruiter: req.user.id });
      await User.findByIdAndUpdate(req.user.id, { company: company._id });
    }
    res.json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ recruiter: req.user.id });
    res.json({ success: true, company: company || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPublicCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    const Job = require('../models/Job');
    const jobs = await Job.find({ company: company._id, status: 'open' })
      .sort({ createdAt: -1 });
    res.json({ success: true, company, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
