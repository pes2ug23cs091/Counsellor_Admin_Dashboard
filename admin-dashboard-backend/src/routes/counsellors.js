const express = require("express");
const {
  getCounsellors,
  createCounsellor,
  updateCounsellor,
  deleteCounsellor,
} = require("../controllers/counsellorController");

const router = express.Router();

// GET all counsellors
router.get("/", getCounsellors);

// POST create counsellor
router.post("/", createCounsellor);

// PUT update counsellor
router.put("/:id", updateCounsellor);

// DELETE counsellor
router.delete("/:id", deleteCounsellor);

module.exports = router;
