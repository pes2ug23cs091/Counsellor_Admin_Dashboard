const express = require("express");
const {
  getUsers,
  getCompletedUsers,
  createUser,
  updateUser,
  deleteUser,
  assignCounsellor,
} = require("../controllers/userController");

const router = express.Router();

// GET all users
router.get("/", getUsers);

// GET all completed users (must be before /:id routes)
router.get("/completed-users", getCompletedUsers);

// POST create user
router.post("/", createUser);

// PUT update user
router.put("/:id", updateUser);

// DELETE user
router.delete("/:id", deleteUser);

// POST assign counsellor to user
router.post("/:id/assign-counsellor", assignCounsellor);

module.exports = router;
