const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Upload = require('../models/Upload');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { createCrudController } = require('../utils/crudController');

const router = express.Router();
const ctrl = createCrudController(Assignment);
const maxUploadSizeBytes = Number(process.env.MAX_UPLOAD_SIZE_BYTES || 10 * 1024 * 1024);
const allowedExtensions = new Set(['.pdf', '.doc', '.docx', '.txt', '.csv', '.png', '.jpg', '.jpeg', '.webp']);
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/webp'
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: maxUploadSizeBytes },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error('Unsupported file type'));
    }
    return cb(null, true);
  }
});

router.get('/my', protect, requireRole('student'), async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const assignments = await Assignment.find({
      gradeLevel: student.gradeLevel,
      ...(student.section ? { section: student.section } : {})
    }).sort({ dueDate: 1 });

    const submissions = await AssignmentSubmission.find({ student: student._id });
    const statusMap = new Map(submissions.map((s) => [s.assignment.toString(), s.status]));

    const enriched = assignments.map((a) => ({
      ...a.toObject(),
      status: statusMap.get(a._id.toString()) || 'open'
    }));

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

router.get('/my-submissions', protect, requireRole('student'), async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const submissions = await AssignmentSubmission.find({ student: student._id })
      .populate('assignment')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/submit', protect, requireRole('student'), upload.single('file'), async (req, res, next) => {
  const file = req.file;
  const filePath = file ? path.join(process.env.UPLOAD_DIR || 'uploads', file.filename) : null;

  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    let uploadDoc = null;
    let submission = null;

    const persistSubmission = async (session = null) => {
      const dbOptions = session ? { session } : undefined;

      if (file) {
        const uploadData = {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
          uploadedBy: req.user._id
        };
        if (session) {
          uploadDoc = (await Upload.create([uploadData], dbOptions))[0];
        } else {
          uploadDoc = await Upload.create(uploadData);
        }
      }

      const update = {
        $set: {
          status: 'completed',
          submittedAt: new Date(),
          ...(file
            ? {
                fileName: file.originalname,
                fileUrl: `/uploads/${file.filename}`,
                mimeType: file.mimetype,
                size: file.size,
                uploadId: uploadDoc ? uploadDoc._id : undefined
              }
            : {})
        }
      };

      submission = await AssignmentSubmission.findOneAndUpdate(
        { assignment: assignment._id, student: student._id },
        update,
        { new: true, upsert: true, ...(session ? { session } : {}) }
      );
    };

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await persistSubmission(session);
      });
    } catch (txErr) {
      const txUnsupported = /Transaction numbers are only allowed on a replica set member or mongos/i.test(txErr.message || '');
      if (!txUnsupported) throw txErr;

      // Fallback for local non-replica-set MongoDB: write with explicit rollback cleanup.
      try {
        await persistSubmission();
      } catch (fallbackErr) {
        if (uploadDoc && uploadDoc._id) await Upload.deleteOne({ _id: uploadDoc._id });
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw fallbackErr;
      }
    } finally {
      session.endSession();
    }

    res.json(submission);
  } catch (err) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(err);
  }
});

router.get('/:id/submissions', protect, requireRole('admin', 'teacher', 'staff'), async (req, res, next) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignment: req.params.id })
      .populate('student')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

router.patch('/submissions/:id', protect, requireRole('admin', 'teacher', 'staff'), async (req, res, next) => {
  try {
    const { score, feedback } = req.body;
    const submission = await AssignmentSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.score = score;
    submission.feedback = feedback;
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    await submission.save();

    res.json(submission);
  } catch (err) {
    next(err);
  }
});

router.use(protect, requireRole('admin', 'teacher', 'staff'));

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
