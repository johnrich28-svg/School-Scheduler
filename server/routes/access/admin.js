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

module.exports = router;
