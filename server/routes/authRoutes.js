const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  approveAdmin,
  approveUser,
} = require("../controllers/authController");
const {
  protect,
  isAdmin,
  isSuperAdmin,
} = require("../middleware/authMiddleware");
const {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  SearchAdmin,
} = require("../controllers/adminAccountController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/approve-admin/:id", protect, isSuperAdmin, approveAdmin);
router.put("/approve-user/:id", protect, isAdmin, approveUser);

// Super Admin CRUD for Admin
router.post("/create-admin", protect, isSuperAdmin, createAdmin);
router.get("/get-admins", protect, isSuperAdmin, getAdmins);
router.put("/update-admin/:id", protect, isSuperAdmin, updateAdmin);
router.delete("/delete-admin/:id", protect, isSuperAdmin, deleteAdmin);
router.get("/search-admin/:search", protect, isSuperAdmin, SearchAdmin);

module.exports = router;
