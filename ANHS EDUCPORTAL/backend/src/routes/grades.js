const express = require('express');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const ParentLink = require('../models/ParentLink');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { createCrudController } = require('../utils/crudController');

const router = express.Router();
const ctrl = createCrudController(Grade);

router.get('/my', protect, requireRole('student'), async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const grades = await Grade.find({ student: student._id }).sort({ createdAt: -1 });
    res.json(grades);
  } catch (err) {
    next(err);
  }
});

router.get('/by-student/:studentId', protect, async (req, res, next) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (req.user.role === 'parent') {
      const parent = await Parent.findOne({ user: req.user._id });
      if (!parent) return res.status(403).json({ message: 'Parent profile not found' });
      const link = await ParentLink.findOne({ parent: parent._id, student: student._id, status: 'approved' });
      if (!link) return res.status(403).json({ message: 'Not linked to this student' });
    }

    if (!['admin', 'teacher', 'staff', 'parent'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const grades = await Grade.find({ student: student._id }).sort({ createdAt: -1 });
    res.json(grades);
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
