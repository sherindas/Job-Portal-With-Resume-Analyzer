const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  sender:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:        { type: String, default: '' },
  fileUrl:     { type: String, default: '' },   // uploaded file path
  fileName:    { type: String, default: '' },   // original filename
  fileType:    { type: String, default: '' },   // 'image' | 'file'
  read:        { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
