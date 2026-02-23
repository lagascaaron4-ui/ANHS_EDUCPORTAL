function createCrudController(Model, options = {}) {
  return {
    async create(req, res, next) {
      try {
        const doc = await Model.create(req.body);
        res.status(201).json(doc);
      } catch (err) {
        next(err);
      }
    },
    async list(req, res, next) {
      try {
        const docs = await Model.find(options.listFilter || {}).sort({ createdAt: -1 });
        res.json(docs);
      } catch (err) {
        next(err);
      }
    },
    async get(req, res, next) {
      try {
        const doc = await Model.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Not found' });
        res.json(doc);
      } catch (err) {
        next(err);
      }
    },
    async update(req, res, next) {
      try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doc) return res.status(404).json({ message: 'Not found' });
        res.json(doc);
      } catch (err) {
        next(err);
      }
    },
    async remove(req, res, next) {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
      } catch (err) {
        next(err);
      }
    }
  };
}

module.exports = { createCrudController };
