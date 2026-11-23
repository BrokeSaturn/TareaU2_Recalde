const { Router } = require("express");
const bookController = require("../controllers/book.controller");
const { authenticateToken } = require("../middlewares/auth");

const router = Router();
router.get("/", bookController.list); // público
router.get("/:id", bookController.getById); // público
router.post("/", authenticateToken, bookController.create); // escrituras con JWT
router.put("/:id", authenticateToken, bookController.update);
router.delete("/:id", authenticateToken, bookController.remove);

module.exports = router;