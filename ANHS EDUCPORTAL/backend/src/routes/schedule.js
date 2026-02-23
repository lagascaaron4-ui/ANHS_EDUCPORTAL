const express = require('express');
const Schedule = require('../models/Schedule');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { createCrudController } = require('../utils/crudController');

const router = express.Router();
const ctrl = createCrudController(Schedule);

router.get('/my', protect, requireRole('student'), async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const schedule = await Schedule.find({
      gradeLevel: student.gradeLevel,
      ...(student.section ? { section: student.section } : {})
    }).sort({ createdAt: 1 });

    res.json(schedule);
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
