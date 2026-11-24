const { Router } = require("express");
const authRoutes = require("./auth.routes");
const bookRoutes = require("./book.routes");
const loanRoutes = require("./loan.routes");

const router = Router();
router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/loans", loanRoutes);

module.exports = router;