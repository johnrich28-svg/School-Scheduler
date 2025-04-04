const User = require("../models/Users");

const createAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the email already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create new admin user
    const admin = new User({
      username,
      email,
      password, // It will be hashed in the schema
      role: "admin",
      isApproved: true, // Auto-approved for admins
    });

    await admin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all Admin users (Super Admin only)
const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Admin user (Super Admin only)
const updateAdmin = async (req, res) => {
  const { username, email, role } = req.body;

  try {
    const admin = await User.findById(req.params.id);

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update admin fields
    admin.username = username || admin.username;
    admin.email = email || admin.email;
    admin.role = role || admin.role; // Make sure role remains 'admin'

    await admin.save();
    res.json({ message: "Admin updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Admin user (Super Admin only)
const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    await User.deleteOne({ _id: admin._id });

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const SearchAdmin = async (req, res) => {
  try {
    const searchQuery = req.params.search || "";

    // Search by email, case-insensitive, partial match
    const admins = await User.find({
      role: "admin",
      email: { $regex: searchQuery, $options: "i" }, // Partial match, case-insensitive
    });

    if (admins.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admins);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  SearchAdmin,
};
