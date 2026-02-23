const express = require('express');
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { createCrudController } = require('../utils/crudController');

const router = express.Router();
const ctrl = createCrudController(Announcement);

router.use(protect);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

router.post('/', requireRole('admin', 'staff'), ctrl.create);
router.put('/:id', requireRole('admin', 'staff'), ctrl.update);
router.delete('/:id', requireRole('admin', 'staff'), ctrl.remove);

module.exports = router;
