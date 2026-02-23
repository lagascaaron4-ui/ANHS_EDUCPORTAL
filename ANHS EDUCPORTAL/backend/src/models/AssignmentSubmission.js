const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['submitted', 'completed'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now },
    fileName: { type: String },
    fileUrl: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload' },
    score: { type: Number },
    feedback: { type: String },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gradedAt: { type: Date }
  },
  { timestamps: true }
);

assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
