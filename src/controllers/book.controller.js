const bookService = require("../services/book.service");

// GET /api/books → 200
const list = async (req, res, next) => {
  try {
    res.json(await bookService.list(req.query));
  } catch (err) {
    next(err);
  }
};

// GET /api/books/:id → 200 / 400 / 404
const getById = async (req, res, next) => {
  try {
    res.json(await bookService.getById(req.params.id));
  } catch (err) {
    next(err);
  }
};

// POST /api/books → 201 / 400
const create = async (req, res, next) => {
  try {
    res.status(201).json(await bookService.create(req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

// PUT /api/books/:id → 200 / 400 / 404
const update = async (req, res, next) => {
  try {
    res.json(await bookService.update(req.params.id, req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/books/:id → 200 / 404 / 409
const remove = async (req, res, next) => {
  try {
    await bookService.remove(req.params.id);
    res.json({ message: "Libro eliminado" });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove };