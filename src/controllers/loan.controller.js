const loanService = require("../services/loan.service");
const HttpError = require("../utils/httpError");

const parseId = (req) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
  return id;
};

// POST /api/loans → 201 / 400 / 404 / 409
const create = async (req, res, next) => {
  try {
    res.status(201).json(await loanService.create(req.user.id, req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/loans/:id/return → 200 / 403 / 404
const giveBack = async (req, res, next) => {
  try {
    res.json(await loanService.giveBack(req.user.id, parseId(req)));
  } catch (err) {
    next(err);
  }
};

// GET /api/loans/me → 200
const myLoans = async (req, res, next) => {
  try {
    res.json(await loanService.myLoans(req.user.id));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/loans/:id → 200 / 403 / 404
const remove = async (req, res, next) => {
  try {
    await loanService.remove(req.user.id, parseId(req));
    res.json({ message: "Préstamo eliminado" });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, giveBack, myLoans, remove };