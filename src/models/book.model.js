const mongoose = require("mongoose");

// Edición: va EMBEBIDA en el libro (son pocas, se leen junto y casi no cambian)
const editionSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: [true, "El número de la edición es obligatorio"],
      min: [1, "El número de la edición debe ser 1 o mayor"],
    },
    year: {
      type: Number,
      required: [true, "El año de la edición es obligatorio"],
      min: [1450, "El año de la edición no puede ser menor a 1450"],
      max: [2026, "El año de la edición no puede ser mayor a 2026"],
    },
    publisher: { type: String, trim: true },
  },
  { _id: false }
);

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      minlength: [2, "El título debe tener al menos 2 caracteres"],
    },
    isbn: {
      type: String,
      required: [true, "El ISBN es obligatorio"],
      unique: true,
      match: [/^97[89]\d{10}$/, "El ISBN debe tener 13 dígitos y empezar con 978 o 979"],
    },
    // Arreglo embebido + validación propia
    authors: {
      type: [String],
      validate: {
        validator: (v) => v.length > 0,
        message: "El libro debe tener al menos un autor",
      },
    },
    genres: [
      {
        type: String,
        enum: {
          values: ["novela", "cuento", "poesia", "ciencia", "historia", "infantil", "tecnologia"],
          message: "El género {VALUE} no es válido",
        },
      },
    ],
    editions: [editionSchema],
    pages: {
      type: Number,
      min: [1, "El libro debe tener al menos 1 página"],
      max: [5000, "El libro no puede tener más de 5000 páginas"],
    },
    slug: String, // lo llena el pre("validate")
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Virtual: no se guarda, se calcula al responder
bookSchema.virtual("authorsText").get(function () {
  return this.authors?.join(", ");
});

// Middleware de Mongoose 9: sin next
bookSchema.pre("validate", function () {
  if (this.title) this.slug = this.title.toLowerCase().trim().replaceAll(" ", "-");
  this.genres = this.genres.map((g) => g.trim().toLowerCase());
});

// Índice para buscar y ordenar por título
bookSchema.index({ title: 1 });

module.exports = mongoose.model("Book", bookSchema);