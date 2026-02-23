const express = require('express');
const Program = require('../models/Program');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { createCrudController } = require('../utils/crudController');

const router = express.Router();
const ctrl = createCrudController(Program);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

router.use(protect, requireRole('admin', 'staff'));

router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
