const express = require("express");
const { register, login, getProfile, logout } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", register);
router.post("/login", login);

// Protected routes (authentication required)
router.get("/profile", authMiddleware, getProfile);
router.post("/logout", authMiddleware, logout);

// Verify token validity
router.get("/verify", authMiddleware, (req, res) => {
  res.json({
    message: "Token is valid",
    admin: req.admin,
  });
});

module.exports = router;
