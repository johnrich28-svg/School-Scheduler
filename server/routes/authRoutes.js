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

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/approve-admin/:id", protect, isSuperAdmin, approveAdmin);
router.put("/approve-user/:id", protect, isAdmin, approveUser);

module.exports = router;
