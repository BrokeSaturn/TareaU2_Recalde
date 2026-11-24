const { Router } = require("express");
const reviewController = require("../controllers/review.controller");
const { authenticateToken } = require("../middlewares/auth");

const router = Router();
router.post("/", authenticateToken, reviewController.create); // escritura con JWT
router.get("/", reviewController.list); // público

module.exports = router;