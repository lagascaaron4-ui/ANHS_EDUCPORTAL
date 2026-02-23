const express = require('express');
const Parent = require('../models/Parent');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.use(protect);

router.get('/me', requireRole('parent'), async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id }).populate('children');
    if (!parent) return res.status(404).json({ message: 'Parent profile not found' });
    res.json(parent);
  } catch (err) {
    next(err);
  }
});

router.put('/me', requireRole('parent'), async (req, res, next) => {
  try {
    const allowedParentFields = ['firstName', 'lastName', 'contactInfo', 'relationship'];
    const parentUpdates = {};
    for (const key of allowedParentFields) {
      if (typeof req.body[key] !== 'undefined') parentUpdates[key] = req.body[key];
    }

    const parent = await Parent.findOneAndUpdate(
      { user: req.user._id },
      parentUpdates,
      { new: true, runValidators: true }
    ).populate('children');

    if (!parent) return res.status(404).json({ message: 'Parent profile not found' });

    if (parentUpdates.firstName || parentUpdates.lastName) {
      const first = parentUpdates.firstName || parent.firstName || '';
      const last = parentUpdates.lastName || parent.lastName || '';
      const fullName = `${first} ${last}`.trim();
      if (fullName) {
        await User.updateOne({ _id: req.user._id }, { $set: { name: fullName } });
      }
    }

    res.json(parent);
  } catch (err) {
    next(err);
  }
});

router.use(requireRole('admin', 'staff'));

router.post('/', async (req, res, next) => {
  try {
    const doc = await Parent.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const docs = await Parent.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Parent.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const doc = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Parent.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
