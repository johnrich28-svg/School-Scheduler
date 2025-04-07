const express = require("express");
const router = express.Router();
const { approveUser } = require("../../controllers/authController");
const { protect, isAdmin } = require("../../middleware/authMiddleware");
const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  searchUser,
} = require("../../controllers/userAccountController");
const {
  createYear,
  getAllYears,
  updateYear,
  deleteYear,
  searchYears,
} = require("../../controllers/adminYearController");
const {
  createSection,
  getSections,
  updateSection,
  deleteSection,
  searchSections,
} = require("../../controllers/adminSectionController");

// Admin Approve User
router.put("/approve-user/:id", protect, isAdmin, approveUser);

// Admin CRUD for Users
router.post("/create-user", protect, isAdmin, createUser);
router.get("/get-users", protect, isAdmin, getUsers);
router.put("/update-user/:id", protect, isAdmin, updateUser);
router.delete("/delete-user/:id", protect, isAdmin, deleteUser);
router.get("/search-user/:search", protect, isAdmin, searchUser);

// Admin CRUD for Years
router.post("/create-year", protect, isAdmin, createYear);
router.get("/get-year", protect, isAdmin, getAllYears);
router.put("/update-year/:id", protect, isAdmin, updateYear);
router.delete("/delete-year/:id", protect, isAdmin, deleteYear);
router.get("/search-year/:search", protect, isAdmin, searchYears);

// Admin CRUD for Sections
router.post("/create-section", protect, isAdmin, createSection);
router.get("/get-section", protect, isAdmin, getSections);
router.put("/update-section/:id", protect, isAdmin, updateSection);
router.delete("/delete-section/:id", protect, isAdmin, deleteSection);
router.get("/search-section/:search", protect, isAdmin, searchSections);

module.exports = router;
