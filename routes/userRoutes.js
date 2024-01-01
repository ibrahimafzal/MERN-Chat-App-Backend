const express = require("express");
const { loginController, registerController, fetchAllUsers } = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router()

router.post("/register", registerController)
router.post("/login", loginController)
router.get("/all-users", protect, fetchAllUsers)
router.get("/all-users", protect, fetchAllUsers)

module.exports = router;