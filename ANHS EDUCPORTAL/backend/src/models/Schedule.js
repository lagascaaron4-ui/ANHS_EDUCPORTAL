const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    teacherName: { type: String },
    room: { type: String },
    time: { type: String, required: true },
    day: { type: String },
    gradeLevel: { type: String, required: true },
    section: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
