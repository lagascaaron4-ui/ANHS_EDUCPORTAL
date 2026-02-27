const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Upload = require('../models/Upload');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();
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

router.post('/', protect, requireRole('admin', 'staff', 'teacher'), upload.single('file'), async (req, res, next) => {
  const file = req.file;
  const filePath = file ? path.join(process.env.UPLOAD_DIR || 'uploads', file.filename) : null;

  try {
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const doc = await Upload.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploadedBy: req.user._id
    });

    res.status(201).json(doc);
  } catch (err) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(err);
  }
});

router.get('/', protect, requireRole('admin', 'staff', 'teacher', 'student', 'parent'), async (req, res, next) => {
  try {
    const docs = await Upload.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, requireRole('admin', 'staff', 'teacher'), async (req, res, next) => {
  try {
    const doc = await Upload.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', doc.filename);
    await doc.deleteOne();

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (fileErr) {
        console.warn('Failed to remove file after metadata deletion:', fileErr.message);
      }
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/download', protect, requireRole('admin', 'staff', 'teacher', 'student', 'parent'), async (req, res, next) => {
  try {
    const doc = await Upload.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    const isPrivileged = ['admin', 'staff', 'teacher'].includes(req.user.role);
    const isOwner = doc.uploadedBy && doc.uploadedBy.toString() === req.user._id.toString();
    if (!isPrivileged && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', doc.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
    return res.download(filePath, doc.originalName);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
