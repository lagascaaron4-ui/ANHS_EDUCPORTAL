const express = require('express');
const Parent = require('../models/Parent');
const ParentMessage = require('../models/ParentMessage');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.use(protect);

router.get('/me', requireRole('parent'), async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) return res.status(404).json({ message: 'Parent profile not found' });

    const docs = await ParentMessage.find({ parent: parent._id })
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

router.post('/me', requireRole('parent'), async (req, res, next) => {
  try {
    const { subject, content, recipient } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ message: 'subject and content are required' });
    }

    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) return res.status(404).json({ message: 'Parent profile not found' });

    const doc = await ParentMessage.create({
      parent: parent._id,
      direction: 'outbound',
      fromRole: 'parent',
      fromName: req.user.name || `${parent.firstName} ${parent.lastName}`.trim() || 'Parent',
      recipient: (recipient || 'School').trim(),
      subject: subject.trim(),
      content: content.trim()
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

router.patch('/me/:id/read', requireRole('parent'), async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) return res.status(404).json({ message: 'Parent profile not found' });

    const doc = await ParentMessage.findOne({ _id: req.params.id, parent: parent._id });
    if (!doc) return res.status(404).json({ message: 'Message not found' });

    if (!doc.readAt) {
      doc.readAt = new Date();
      await doc.save();
    }

    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.get('/', requireRole('admin', 'teacher', 'staff'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.parentId) filter.parent = req.query.parentId;
    const docs = await ParentMessage.find(filter)
      .populate('parent', 'firstName lastName user')
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

router.post('/:parentId/reply', requireRole('admin', 'teacher', 'staff'), async (req, res, next) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ message: 'subject and content are required' });
    }

    const parent = await Parent.findById(req.params.parentId);
    if (!parent) return res.status(404).json({ message: 'Parent not found' });

    const doc = await ParentMessage.create({
      parent: parent._id,
      direction: 'inbound',
      fromRole: req.user.role,
      fromName: req.user.name || req.user.role,
      recipient: `${parent.firstName} ${parent.lastName}`.trim() || 'Parent',
      subject: subject.trim(),
      content: content.trim()
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
