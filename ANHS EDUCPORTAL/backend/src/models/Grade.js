const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subject: { type: String, required: true },
    gradingPeriod: { type: String, required: true },
    score: { type: Number, required: true },
    remarks: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Grade', gradeSchema);
