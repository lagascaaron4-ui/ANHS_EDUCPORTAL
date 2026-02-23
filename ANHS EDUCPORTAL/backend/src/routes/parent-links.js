const express = require('express');
const Parent = require('../models/Parent');
const ParentLink = require('../models/ParentLink');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.use(protect);

router.post('/request', requireRole('parent'), async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId is required' });

    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) return res.status(404).json({ message: 'Parent profile not found' });

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const link = await ParentLink.create({
      parent: parent._id,
      student: student._id,
      requestedBy: 'parent'
    });

    res.status(201).json(link);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Link already exists' });
    }
    next(err);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    if (req.user.role === 'parent') {
      const parent = await Parent.findOne({ user: req.user._id });
      if (!parent) return res.status(404).json({ message: 'Parent profile not found' });
      const links = await ParentLink.find({ parent: parent._id }).populate('student');
      return res.json(links);
    }

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) return res.status(404).json({ message: 'Student profile not found' });
      const links = await ParentLink.find({ student: student._id }).populate('parent');
      return res.json(links);
    }

    const links = await ParentLink.find().sort({ createdAt: -1 });
    return res.json(links);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/approve', async (req, res, next) => {
  try {
    const link = await ParentLink.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student || student._id.toString() !== link.student.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (!['admin', 'teacher', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    link.status = 'approved';
    await link.save();

    await Parent.updateOne(
      { _id: link.parent },
      { $addToSet: { children: link.student } }
    );

    await Student.updateOne(
      { _id: link.student },
      { $addToSet: { parents: link.parent } }
    );

    res.json(link);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reject', async (req, res, next) => {
  try {
    const link = await ParentLink.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student || student._id.toString() !== link.student.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (!['admin', 'teacher', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    link.status = 'rejected';
    await link.save();

    res.json(link);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
