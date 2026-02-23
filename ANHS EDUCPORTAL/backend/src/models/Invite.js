const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['admin', 'teacher'], required: true },
    token: { type: String, required: true, unique: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invite', inviteSchema);
