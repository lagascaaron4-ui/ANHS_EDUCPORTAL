const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teacherId: { type: String, unique: true, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    subjects: [{ type: String }],
    gradeLevels: [{ type: String }],
    contactInfo: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

teacherSchema.index({ user: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Teacher', teacherSchema);
