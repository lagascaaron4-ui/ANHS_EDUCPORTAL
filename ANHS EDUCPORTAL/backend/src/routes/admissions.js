const express = require('express');
const Admission = require('../models/Admission');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { createCrudController } = require('../utils/crudController');

const router = express.Router();
const ctrl = createCrudController(Admission);

router.post('/', async (req, res, next) => {
  try {
    const doc = await Admission.create(req.body);
    res.status(201).json({
      _id: doc._id,
      studentName: doc.studentName,
      gradeLevel: doc.gradeLevel,
      guardianName: doc.guardianName,
      contactInfo: doc.contactInfo,
      previousSchool: doc.previousSchool,
      referenceNumber: doc.referenceNumber,
      status: doc.status,
      submittedAt: doc.submittedAt
    });
  } catch (err) {
    next(err);
  }
});

router.get('/track', async (req, res, next) => {
  try {
    const reference = String(req.query.reference || '').trim();
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!reference || !email) {
      return res.status(400).json({ message: 'reference and email are required' });
    }

    const doc = await Admission.findOne({
      referenceNumber: reference,
      $or: [
        { applicantEmail: email },
        { contactInfo: email }
      ]
    }).select('referenceNumber status submittedAt updatedAt studentName gradeLevel');

    if (!doc) {
      return res.status(404).json({ message: 'No enrollment record found for the provided reference and email.' });
    }

    return res.json({
      referenceNumber: doc.referenceNumber,
      status: doc.status,
      submittedAt: doc.submittedAt,
      updatedAt: doc.updatedAt,
      studentName: doc.studentName,
      gradeLevel: doc.gradeLevel
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', protect, requireRole('admin', 'staff'), ctrl.list);
router.get('/:id', protect, requireRole('admin', 'staff'), ctrl.get);
router.put('/:id', protect, requireRole('admin', 'staff'), ctrl.update);
router.delete('/:id', protect, requireRole('admin', 'staff'), ctrl.remove);

module.exports = router;
