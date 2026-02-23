const express = require('express');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { getMetricsSnapshot } = require('../middleware/metrics');

const router = express.Router();

router.use(protect, requireRole('admin', 'staff'));

router.get('/metrics', (req, res) => {
  res.json({
    success: true,
    data: getMetricsSnapshot()
  });
});

module.exports = router;
