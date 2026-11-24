const mongoose = require("mongoose");
const prisma = require("../db/prisma");
const Review = require("../models/review.model");
const HttpError = require("../utils/httpError");

// POST /api/reviews → crea en MongoDB validando el préstamo en PostgreSQL
const create = async (userId, { loanId, rating, comment }) => {
  if (!Number.isInteger(loanId)) throw new HttpError(400, "El loanId debe ser un número entero");

  // 1. Consulta a PostgreSQL con Prisma: el préstamo y el nombre de su dueño
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { user: { select: { name: true } } },
  });
  if (!loan) throw new HttpError(404, "Préstamo no encontrado");
  if (loan.userId !== userId) throw new HttpError(403, "Solo puedes reseñar tus propios préstamos");

  // 2. Guarda en MongoDB: userId sale del JWT, readerName se COPIA de PostgreSQL
  //    y el libro se toma del préstamo (no del body)
  return Review.create({
    loanId,
    userId,
    readerName: loan.user.name,
    book: loan.bookId,
    rating,
    comment,
  });
};

// GET /api/reviews?book=<id> → lista con populate y orden + promedio con aggregate
const listByBook = async (bookId) => {
  if (!mongoose.isValidObjectId(bookId)) throw new HttpError(400, "El id del libro no es válido");

  const reviews = await Review.find({ book: bookId })
    .populate("book", "title authors") // trae título y autores del libro
    .sort({ createdAt: -1 }); // más nuevas primero

  // aggregate no convierte el id solo: hay que pasarlo a ObjectId
  const stats = await Review.aggregate([
    { $match: { book: new mongoose.Types.ObjectId(bookId) } },
    { $group: { _id: "$book", average: { $avg: "$rating" }, total: { $sum: 1 } } },
  ]);

  return {
    average: stats.length ? stats[0].average : 0,
    total: stats.length ? stats[0].total : 0,
    reviews,
  };
};

module.exports = { create, listByBook };