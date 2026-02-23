const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['present', 'late', 'absent'], default: 'present' }
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    date: { type: Date, required: true },
    records: [attendanceRecordSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
