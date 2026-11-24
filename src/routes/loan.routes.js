const { Router } = require("express");
const loanController = require("../controllers/loan.controller");
const { authenticateToken } = require("../middlewares/auth");

const router = Router();
router.use(authenticateToken); // todas las rutas de préstamos piden token

router.post("/", loanController.create);
router.get("/me", loanController.myLoans); // va antes de /:id
router.patch("/:id/return", loanController.giveBack);
router.delete("/:id", loanController.remove);

module.exports = router;