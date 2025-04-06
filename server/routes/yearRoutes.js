const express = require("express");
const router = express.Router();
const {
  createYear,
  getAllYears,
  updateYear,
  deleteYear,
  searchYears,
} = require("../controllers/adminYearController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.post("/create-year", protect, isAdmin, createYear);
router.get("/get-year", protect, isAdmin, getAllYears);
router.put("/update-year/:id", protect, isAdmin, updateYear);
router.delete("/delete-year/:id", protect, isAdmin, deleteYear);
router.get("/search-year/:search", protect, isAdmin, searchYears);

module.exports = router;
