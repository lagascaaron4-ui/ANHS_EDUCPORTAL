const express = require('express');
const { register, login, me, csrf, getPreferences, updatePreferences, logout } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/google', (req, res) => {
  res.status(501).json({ message: 'Google OAuth is not configured yet. Use email/password login.' });
});
router.get('/microsoft', (req, res) => {
  res.status(501).json({ message: 'Microsoft OAuth is not configured yet. Use email/password login.' });
});
router.get('/csrf', csrf);
router.get('/me', protect, me);
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);
router.post('/logout', logout);

module.exports = router;
