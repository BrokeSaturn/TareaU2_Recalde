# Tarea individual U2 · Modelo híbrido PostgreSQL + MongoDB

**Desarrollo Web Avanzado · ESPE · Unidad 2: Integración con bases NoSQL y APIs REST**

| Dato | Valor |
|---|---|
| Estudiante | Esteban Santiago Recalde Logacho |
| N.º de lista | 13 |
| Caso | 1 · Biblioteca |
| Etiqueta de entrega | `u2-tarea` |

API REST que integra dos bases de datos:

- **PostgreSQL (Prisma 7):** `User` (login con JWT) y `Loan` (préstamo). El préstamo necesita integridad: un libro no se presta dos veces a la vez.
- **MongoDB (Mongoose 9):** `Book` (catálogo con autores, géneros y ediciones embebidos) y `Review` (reseña del préstamo, crece sin límite).

El modelado completo (workload, decisión de base, embeber o referenciar, ERD híbrido, referencias y dato copiado) está en [`docs/Tarea_modelo_hibrido.md`](docs/Tarea_modelo_hibrido.md).

## Cómo levantar el proyecto

```bash
# 1. Contenedores: PostgreSQL (puerto 5433), pgAdmin (5050) y MongoDB (27017)
docker compose up -d

# 2. Variables de entorno
cp .env.example .env        # en Windows: copy .env.example .env

# 3. Dependencias y migración
npm install
npx prisma migrate dev

# 4. Servidor (arranca solo si PostgreSQL y MongoDB conectan)
npm run dev
```

- API: `http://localhost:3000/api`
- pgAdmin: `http://localhost:5050` (admin@espe.com / admin_password). Servidor: host `postgres`, puerto `5432`.
- MongoDB Compass: `mongodb://espe_user:espe_password@localhost:27017/?authSource=admin`

## Estructura

```
src/
├── db/            prisma.js (PostgreSQL) · mongo.js (MongoDB)
├── models/        book.model.js · review.model.js (Mongoose)
├── routes/        → controllers/ → services/ → models/
├── middlewares/   auth (JWT) · errorHandler (Prisma, Mongoose, E11000) · logger · notFound
prisma/            schema.prisma (User, Loan) y migraciones
postman/           colección con más de 30 aserciones
docs/              modelado híbrido y capturas de evidencia
```

## Endpoints

| Método y ruta | Base(s) | Respuestas |
|---|---|---|
| `POST /api/auth/register` · `POST /api/auth/login` | PostgreSQL | 201 / 200 / 400 / 401 / 409 |
| `GET /api/books?q=&fields=&sort=` | MongoDB (regex, proyección y orden) | 200 |
| `GET /api/books/:id` | MongoDB | 200 / 400 / 404 |
| `POST /api/books` (JWT) | MongoDB | 201 / 400 / 401 / 409 |
| `PUT /api/books/:id` (JWT, `findById` + `save()`) | MongoDB | 200 / 400 / 401 / 404 |
| `DELETE /api/books/:id` (JWT) | MongoDB + PostgreSQL | 200 / 404 / 409 si tiene préstamos; si no, borra sus reseñas |
| `POST /api/loans` (JWT) | PostgreSQL validando MongoDB | 201 / 400 / 404 / 409 |
| `GET /api/loans/me` (JWT) | PostgreSQL + MongoDB (`$in` + `Map`, sin N+1) | 200 |
| `PATCH /api/loans/:id/return` (JWT) | PostgreSQL | 200 / 403 / 404 |
| `DELETE /api/loans/:id` (JWT) | PostgreSQL + MongoDB (borra su reseña) | 200 / 403 / 404 |
| `POST /api/reviews` (JWT) | MongoDB validando PostgreSQL | 201 / 400 / 403 / 404 / 409 |
| `GET /api/reviews?book=:id` | MongoDB (`populate`, orden y `aggregate`) | 200 / 400 |

## Integración entre las dos bases

- **Crear préstamo (PostgreSQL validando MongoDB):** el servicio comprueba el `bookId` con `isValidObjectId` y `Book.exists`. El campo `activeBookId` es único, así que un libro prestado no se vuelve a prestar (409).
- **Crear reseña (MongoDB validando PostgreSQL):** el servicio busca el préstamo con Prisma (404 si no existe, 403 si es de otro usuario). El `userId` sale del JWT y `readerName` se copia de `User.name`.
- **Índice único** `reviews.loanId`: una reseña por préstamo; si se repite, error E11000 → 409.
- **Consulta unida:** `GET /api/loans/me` trae los préstamos de PostgreSQL y los libros en una sola consulta con `$in`, unidos con `Map`.
- **Borrado protegido:** un libro con préstamos responde 409; si no tiene, se borran en cascada sus reseñas.

## Índices

| Base | Índice | Para qué |
|---|---|---|
| PostgreSQL | `loans.book_id` (`@@index`) | contar y buscar préstamos por libro |
| PostgreSQL | `loans.active_book_id` (único) | un libro no se presta dos veces a la vez |
| MongoDB | `books.isbn` (único) · `books.title` | ISBN sin repetir · búsqueda y orden por título |
| MongoDB | `reviews.loanId` (único) | una reseña por préstamo |
| MongoDB | `reviews { book: 1, createdAt: -1 }` | listar reseñas de un libro, las más nuevas primero |

## Evidencias

- Colección: [`postman/TareaU2_Recalde.postman_collection.json`](postman/TareaU2_Recalde.postman_collection.json). Crea sus datos y los limpia, por eso se puede correr dos veces seguidas.
- Capturas en [`docs/`](docs/): resumen del *Run collection*, colecciones e índices en Compass, y la tabla `loans` en pgAdmin con la columna `book_id`.
- Video de sustentación: _(enlace)_
