const express = require("express");
const pool = require("../config/database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Admin-only cleanup endpoint to remove old data with NULL admin_id
router.post("/cleanup-old-data", authMiddleware, async (req, res) => {
  try {
    // Only allow admin ID 1 (superadmin) to do cleanup
    if (req.admin.id !== 1) {
      return res.status(403).json({ error: "Only superadmin can cleanup" });
    }

    const usersDeleted = await pool.query("DELETE FROM users WHERE admin_id IS NULL");
    const completedDeleted = await pool.query("DELETE FROM completed_users WHERE admin_id IS NULL");
    const counsellorsDeleted = await pool.query("DELETE FROM counsellors WHERE admin_id IS NULL");

    res.json({
      message: "Cleanup completed",
      deleted: {
        users: usersDeleted.rowCount,
        completed_users: completedDeleted.rowCount,
        counsellors: counsellorsDeleted.rowCount
      }
    });

    console.log(`✅ Cleanup completed: ${usersDeleted.rowCount} users, ${completedDeleted.rowCount} completed, ${counsellorsDeleted.rowCount} counsellors`);
  } catch (error) {
    console.error("❌ Cleanup error:", error.message);
    res.status(500).json({ error: "Cleanup failed" });
  }
});

module.exports = router;
