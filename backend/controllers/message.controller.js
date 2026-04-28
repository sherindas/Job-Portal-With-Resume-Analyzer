const Message = require('../models/Message');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { createNotification } = require('./notification.controller');

const getParties = async (appId, userId) => {
  const app = await Application.findById(appId).populate('job');
  if (!app) return null;
  const isApplicant = app.applicant.toString() === userId;
  const isRecruiter = app.job?.recruiter?.toString() === userId;
  return { app, isApplicant, isRecruiter };
};

// Get messages for an application
exports.getMessages = async (req, res) => {
  try {
    const result = await getParties(req.params.appId, req.user.id);
    if (!result) return res.status(404).json({ success: false, message: 'Application not found' });
    const { isApplicant, isRecruiter } = result;
    if (!isApplicant && !isRecruiter)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await Message.updateMany({ application: req.params.appId, receiver: req.user.id }, { read: true });

    const messages = await Message.find({ application: req.params.appId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Send a message (text or file)
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await getParties(req.params.appId, req.user.id);
    if (!result) return res.status(404).json({ success: false, message: 'Application not found' });
    const { app, isApplicant, isRecruiter } = result;
    if (!isApplicant && !isRecruiter)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (!text?.trim() && !req.file)
      return res.status(400).json({ success: false, message: 'Message or file required' });

    const receiver = isApplicant ? app.job.recruiter : app.applicant;

    let fileUrl = '', fileName = '', fileType = '';
    if (req.file) {
      fileUrl = `uploads/chat/${req.file.filename}`;
      fileName = req.file.originalname;
      const mime = req.file.mimetype || '';
      fileType = mime.startsWith('image/') ? 'image' : 'file';
    }

    const message = await Message.create({
      application: req.params.appId,
      sender: req.user.id,
      receiver,
      text: text?.trim() || '',
      fileUrl, fileName, fileType,
    });

    await message.populate('sender', 'name role');

    const notification = await createNotification({
      user: receiver,
      type: 'application_status',
      title: 'New Message',
      message: `New message regarding "${app.job.title}"`,
      link: '/messages',
    });

    // Emit real-time events via Socket.io
    const io = req.app.get('io');
    if (io) {
      // Push message to everyone in the conversation room
      io.to(`conv_${req.params.appId}`).emit('new_message', message);
      // Push notification to the receiver's personal room
      io.to(receiver.toString()).emit('new_notification', notification);
    }

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all conversations
exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    }).populate({
      path: 'application',
      populate: [
        { path: 'job', select: 'title recruiter' },
        { path: 'applicant', select: 'name avatar' }
      ]
    }).sort({ createdAt: -1 });

    const seen = new Set();
    const conversations = [];
    for (const m of messages) {
      const appId = m.application?._id?.toString();
      if (!appId || seen.has(appId)) continue;
      seen.add(appId);
      const unread = await Message.countDocuments({ application: appId, receiver: req.user.id, read: false });
      conversations.push({ application: m.application, lastMessage: m, unread });
    }
    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Start a conversation — job seeker initiates from job detail page
// Creates a "hello" message if no messages exist yet for this application
exports.startConversation = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const app = await Application.findById(applicationId).populate('job');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    const isApplicant = app.applicant.toString() === req.user.id;
    const isRecruiter = app.job?.recruiter?.toString() === req.user.id;
    if (!isApplicant && !isRecruiter)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    // Return existing or signal ready
    const count = await Message.countDocuments({ application: applicationId });
    res.json({ success: true, applicationId, jobTitle: app.job.title, exists: count > 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
