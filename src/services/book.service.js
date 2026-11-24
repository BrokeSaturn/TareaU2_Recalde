const mongoose = require("mongoose");
const Book = require("../models/book.model");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");
const Review = require("../models/review.model");

const checkId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "El id del libro no es válido");
};

// GET /api/books?q=&fields=&sort=
const list = ({ q, fields, sort }) => {
  // Regex: busca en el título o en los autores, sin importar mayúsculas
  const filter = q
    ? { $or: [{ title: { $regex: q, $options: "i" } }, { authors: { $regex: q, $options: "i" } }] }
    : {};
  // Proyección: ?fields=title,authors
  const projection = fields ? fields.split(",").join(" ") : "";
  // Orden: ?sort=-pages (el - es descendente). Por defecto, por título
  const order = sort ? sort.split(",").join(" ") : "title";
  return Book.find(filter).select(projection).sort(order);
};

const getById = async (id) => {
  checkId(id);
  const book = await Book.findById(id);
  if (!book) throw new HttpError(404, "Libro no encontrado");
  return book;
};

const create = (data) => Book.create(data);

// PUT: findById + save() para que corran las validaciones y el pre("validate")
const update = async (id, data) => {
  const book = await getById(id);
  book.set(data);
  return book.save();
};

// DELETE protegido: si PostgreSQL tiene préstamos de este libro → 409
const remove = async (id) => {
  const book = await getById(id);
  const loans = await prisma.loan.count({ where: { bookId: id } });
  if (loans > 0) throw new HttpError(409, `No se puede eliminar: el libro tiene ${loans} préstamo(s)`);
  await book.deleteOne();
  await Review.deleteMany({ book: id }); // cascada: borra sus reseñas en MongoDB
};

module.exports = { list, getById, create, update, remove };