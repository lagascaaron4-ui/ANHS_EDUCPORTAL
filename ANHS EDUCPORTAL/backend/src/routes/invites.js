const express = require('express');
const crypto = require('crypto');
const Invite = require('../models/Invite');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/validate/:token', async (req, res, next) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token, usedAt: null });
    if (!invite) return res.json({ valid: false });
    if (invite.expiresAt < new Date()) return res.json({ valid: false });
    return res.json({ valid: true, role: invite.role, email: invite.email });
  } catch (err) {
    next(err);
  }
});

router.use(protect, requireRole('admin', 'teacher'));

router.post('/', async (req, res, next) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }

    if (!['admin', 'teacher'].includes(role)) {
      return res.status(400).json({ message: 'Role must be admin or teacher' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await Invite.create({
      email: email.toLowerCase(),
      role,
      token,
      invitedBy: req.user._id,
      expiresAt
    });

    res.status(201).json(invite);
  } catch (err) {
    next(err);
  }
});

router.get('/', requireRole('admin'), async (req, res, next) => {
  try {
    const invites = await Invite.find().sort({ createdAt: -1 });
    res.json(invites);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
