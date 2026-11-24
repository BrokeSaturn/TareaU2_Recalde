const mongoose = require("mongoose");
const prisma = require("../db/prisma");
const Book = require("../models/book.model");
const HttpError = require("../utils/httpError");

// Busca el préstamo y comprueba que sea del usuario del token
const findOwn = async (userId, id) => {
  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) throw new HttpError(404, "Préstamo no encontrado");
  if (loan.userId !== userId) throw new HttpError(403, "Este préstamo no es tuyo");
  return loan;
};

// POST /api/loans → crea en PostgreSQL validando que el libro exista en MongoDB
const create = async (userId, { bookId, dueDate }) => {
  if (!mongoose.isValidObjectId(bookId)) throw new HttpError(400, "El bookId no es válido");
  if (!dueDate || isNaN(Date.parse(dueDate))) throw new HttpError(400, "La fecha límite (dueDate) no es válida");

  const existe = await Book.exists({ _id: bookId });
  if (!existe) throw new HttpError(404, "El libro no existe en el catálogo");

  // Un libro no se presta dos veces a la vez
  const activo = await prisma.loan.findUnique({ where: { activeBookId: bookId } });
  if (activo) throw new HttpError(409, "El libro ya está prestado");

  // activeBookId también es @unique: si dos piden a la vez, PostgreSQL rechaza el segundo (P2002 → 409)
  return prisma.loan.create({
    data: { userId, bookId, activeBookId: bookId, dueDate: new Date(dueDate) },
  });
};

// PATCH /api/loans/:id/return → libera el libro (activeBookId = null)
const giveBack = async (userId, id) => {
  await findOwn(userId, id);
  return prisma.loan.update({
    where: { id },
    data: { returnedAt: new Date(), activeBookId: null },
  });
};

// GET /api/loans/me → datos de PostgreSQL + título y autores de MongoDB con $in (sin N+1)
const myLoans = async (userId) => {
  const loans = await prisma.loan.findMany({ where: { userId }, orderBy: { loanDate: "desc" } });
  const ids = loans.map((l) => l.bookId);
  // UNA sola consulta a MongoDB para todos los libros
  const books = await Book.find({ _id: { $in: ids } }).select("title authors");
  // Map: _id del libro → libro, para unir sin volver a consultar
  const map = new Map(books.map((b) => [b._id.toString(), b]));
  return loans.map((l) => ({ ...l, book: map.get(l.bookId) || null }));
};

// DELETE /api/loans/:id
const remove = async (userId, id) => {
  await findOwn(userId, id);
  await prisma.loan.delete({ where: { id } });
  // Fase 4: aquí se borra también su reseña en MongoDB
};

module.exports = { create, giveBack, myLoans, remove };