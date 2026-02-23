const express = require('express');
const News = require('../models/News');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { createCrudController } = require('../utils/crudController');

const router = express.Router();
const ctrl = createCrudController(News);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

router.use(protect, requireRole('admin', 'staff'));

router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
