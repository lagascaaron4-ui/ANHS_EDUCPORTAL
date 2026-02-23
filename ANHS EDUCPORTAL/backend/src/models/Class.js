const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    section: { type: String },
    adviser: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    schoolYear: { type: String },
    schedule: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);
