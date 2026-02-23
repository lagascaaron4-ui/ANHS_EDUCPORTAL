const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, unique: true, sparse: true, trim: true },
    studentName: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    applicantEmail: { type: String, lowercase: true, trim: true },
    guardianName: { type: String },
    contactInfo: { type: String },
    previousSchool: { type: String },
    status: { type: String, enum: ['submitted', 'reviewing', 'accepted', 'rejected'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

function generateReferenceNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ANHS-${stamp}-${rand}`;
}

admissionSchema.pre('validate', function ensureReference(next) {
  if (!this.referenceNumber) {
    this.referenceNumber = generateReferenceNumber();
  }
  next();
});

module.exports = mongoose.model('Admission', admissionSchema);
