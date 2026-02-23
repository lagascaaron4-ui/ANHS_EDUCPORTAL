const mongoose = require('mongoose');

const parentLinkSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedBy: { type: String, enum: ['parent', 'student', 'admin'], default: 'parent' }
  },
  { timestamps: true }
);

parentLinkSchema.index({ parent: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('ParentLink', parentLinkSchema);
