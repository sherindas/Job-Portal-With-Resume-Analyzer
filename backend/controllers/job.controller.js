const Job = require('../models/Job');
const Application = require('../models/Application');

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, recruiter: req.user.id, company: req.user.company });
    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { keyword, location, jobType, minSalary, maxSalary, sort, company, page = 1, limit = 12 } = req.query;
    const query = { status: 'open' };

    if (keyword) query.$text = { $search: keyword };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType) query.jobType = jobType;
    if (minSalary) query['salary.min'] = { $gte: Number(minSalary) };
    if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };

    // Company name filter — find matching company IDs first
    if (company) {
      const Company = require('../models/Company');
      const companies = await Company.find({ name: { $regex: company, $options: 'i' } }).select('_id');
      query.company = { $in: companies.map(c => c._id) };
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'salary') sortObj = { 'salary.max': -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query).populate('company', 'name location').sort(sortObj).skip(skip).limit(Number(limit)),
      Job.countDocuments(query),
    ]);
    res.json({ success: true, jobs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company').populate('recruiter', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, recruiter: req.user.id },
      req.body, { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .populate('company', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Unauthorized' });
    const applications = await Application.find({ job: req.params.id })
      .populate('applicant', 'name email phone skills experience education portfolioLinks avatar')
      .sort({ createdAt: -1 });
    // Normalize field name so frontend gets consistent `userId` key
    const applicants = applications.map(a => ({
      _id: a._id,
      status: a.status,
      resume: a.resumeFile,
      coverLetter: a.coverLetter,
      createdAt: a.createdAt,
      userId: a.applicant,
    }));
    res.json({ success: true, applicants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    job.status = job.status === 'open' ? 'closed' : 'open';
    await job.save();
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRecommendedJobs = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user?.skills?.length) {
      const jobs = await Job.find({ status: 'open' }).populate('company', 'name location').sort({ createdAt: -1 }).limit(6);
      return res.json({ success: true, jobs });
    }
    // Find jobs matching user skills
    const jobs = await Job.find({
      status: 'open',
      skillsRequired: { $in: user.skills.map(s => new RegExp(s, 'i')) },
    }).populate('company', 'name location').sort({ createdAt: -1 }).limit(6);

    // Fallback to latest if no matches
    if (!jobs.length) {
      const fallback = await Job.find({ status: 'open' }).populate('company', 'name location').sort({ createdAt: -1 }).limit(6);
      return res.json({ success: true, jobs: fallback });
    }
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
