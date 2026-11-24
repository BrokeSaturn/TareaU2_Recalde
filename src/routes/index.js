const { Router } = require("express");
const authRoutes = require("./auth.routes");
const bookRoutes = require("./book.routes");
const loanRoutes = require("./loan.routes");
const reviewRoutes = require("./review.routes");

const router = Router();
router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/loans", loanRoutes);
router.use("/reviews", reviewRoutes);

module.exports = router;