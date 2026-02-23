const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    contactInfo: { type: String },
    relationship: { type: String },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Parent', parentSchema);
