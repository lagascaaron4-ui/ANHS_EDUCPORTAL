const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { createCrudController } = require('../utils/crudController');

const router = express.Router();
const ctrl = createCrudController(Student);

router.get('/me', protect, requireRole('student'), async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
});

router.put('/me', protect, requireRole('student'), async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const allowed = ['firstName', 'lastName', 'birthDate', 'contactInfo', 'address', 'guardianName', 'guardianContact'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) student[field] = req.body[field];
    });

    await student.save();

    if (req.body.email || req.body.name) {
      const updates = {};
      if (req.body.email) updates.email = req.body.email;
      if (req.body.name) updates.name = req.body.name;
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(req.user._id, updates);
      }
    }

    res.json(student);
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
