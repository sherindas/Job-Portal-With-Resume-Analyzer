const Application = require('../models/Application');
const Job = require('../models/Job');
const { createNotification } = require('./notification.controller');

exports.apply = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const job = await Job.findById(jobId).populate('recruiter', 'name');
    if (!job || job.status !== 'open')
      return res.status(400).json({ success: false, message: 'Job is not available' });

    if (await Application.findOne({ job: jobId, applicant: req.user.id }))
      return res.status(400).json({ success: false, message: 'Already applied to this job' });

    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      coverLetter: coverLetter || '',
      resumeFile: req.file ? `uploads/resumes/${req.file.filename}` : '',
    });

    await Job.findByIdAndUpdate(jobId, { $push: { applicants: application._id } });

    // Notify recruiter of new applicant
    const notification = await createNotification({
      user: job.recruiter._id,
      type: 'new_applicant',
      title: 'New Application Received',
      message: `Someone applied for "${job.title}"`,
      link: '/recruiter/dashboard',
    });

    const io = req.app.get('io');
    if (io && notification) {
      io.to(job.recruiter._id.toString()).emit('new_notification', notification);
    }

    res.status(201).json({ success: true, application });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Already applied' });
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate({ path: 'job', populate: { path: 'company', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, applicant: req.user.id });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    await Job.findByIdAndUpdate(app.job, { $pull: { applicants: app._id } });
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, recruiterNotes } = req.body;
    const app = await Application.findById(req.params.id).populate('job').populate('applicant', 'name');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    if (app.job.recruiter.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    app.status = status;
    if (recruiterNotes) app.recruiterNotes = recruiterNotes;
    await app.save();

    // Notify job seeker of status change
    const messages = {
      shortlisted: `Great news! You've been shortlisted for "${app.job.title}"`,
      rejected:    `Your application for "${app.job.title}" was not selected`,
      hired:       `Congratulations! You've been hired for "${app.job.title}"`,
      reviewed:    `Your application for "${app.job.title}" has been reviewed`,
    };
    if (messages[status]) {
      const notification = await createNotification({
        user: app.applicant._id,
        type: 'application_status',
        title: status === 'hired' ? '🎉 Hired!' : status === 'shortlisted' ? '⭐ Shortlisted!' : 'Application Update',
        message: messages[status],
        link: '/dashboard',
      });

      const io = req.app.get('io');
      if (io && notification) {
        io.to(app.applicant._id.toString()).emit('new_notification', notification);
      }
    }

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
