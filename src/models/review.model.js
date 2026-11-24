const mongoose = require("mongoose");

// Reseña de un préstamo: crece sin límite → colección aparte (no embebida en Book)
const reviewSchema = new mongoose.Schema(
  {
    loanId: {
      type: Number, // id del préstamo en PostgreSQL (sin FK, lo valida el servicio)
      required: [true, "El loanId es obligatorio"],
      min: [1, "El loanId debe ser mayor o igual a 1"],
    },
    userId: {
      type: Number, // id del usuario en PostgreSQL (sale del JWT)
      required: [true, "El userId es obligatorio"],
    },
    readerName: {
      type: String, // COPIA de User.name (desnormalización)
      required: [true, "El nombre del lector es obligatorio"],
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book", // referencia dentro de MongoDB → populate
      required: [true, "El libro es obligatorio"],
    },
    rating: {
      type: Number,
      required: [true, "La calificación es obligatoria"],
      min: [1, "La calificación mínima es 1"],
      max: [5, "La calificación máxima es 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [300, "El comentario no puede pasar de 300 caracteres"],
    },
  },
  { timestamps: true }
);

// Una sola reseña por préstamo: si se repite → E11000 → 409
reviewSchema.index({ loanId: 1 }, { unique: true });
// Para listar las reseñas de un libro, las más nuevas primero
reviewSchema.index({ book: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);