const mongoose = require('mongoose');

const parentMessageSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    fromRole: { type: String, enum: ['parent', 'teacher', 'staff', 'admin', 'system'], required: true },
    fromName: { type: String, required: true, trim: true },
    recipient: { type: String, trim: true, default: 'School' },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ParentMessage', parentMessageSchema);
