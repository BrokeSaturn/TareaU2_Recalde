const reviewService = require("../services/review.service");

// POST /api/reviews → 201 / 400 / 403 / 404 / 409
const create = async (req, res, next) => {
  try {
    res.status(201).json(await reviewService.create(req.user.id, req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

// GET /api/reviews?book=<id> → 200 / 400
const list = async (req, res, next) => {
  try {
    res.json(await reviewService.listByBook(req.query.book));
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list };