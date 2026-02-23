const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentId: { type: String, unique: true, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gradeLevel: { type: String, required: true },
    section: { type: String },
    birthDate: { type: Date },
    contactInfo: { type: String },
    address: { type: String },
    guardianName: { type: String },
    guardianContact: { type: String },
    parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Parent' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
