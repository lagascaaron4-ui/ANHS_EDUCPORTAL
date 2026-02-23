const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { createCrudController } = require('../utils/crudController');

const router = express.Router();
const ctrl = createCrudController(ContactMessage);

router.post('/', ctrl.create);

router.get('/', protect, requireRole('admin', 'staff'), ctrl.list);
router.get('/:id', protect, requireRole('admin', 'staff'), ctrl.get);
router.delete('/:id', protect, requireRole('admin', 'staff'), ctrl.remove);

module.exports = router;
