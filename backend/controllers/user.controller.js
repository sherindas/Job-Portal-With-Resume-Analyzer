const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('company').populate('savedJobs');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'skills', 'education', 'experience', 'portfolioLinks', 'jobPreferences'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).populate('company');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleSaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const idx = user.savedJobs.indexOf(req.params.jobId);
    if (idx === -1) user.savedJobs.push(req.params.jobId);
    else user.savedJobs.splice(idx, 1);
    await user.save();
    res.json({ success: true, saved: idx === -1, savedJobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({ path: 'savedJobs', populate: { path: 'company', select: 'name' } });
    res.json({ success: true, jobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
