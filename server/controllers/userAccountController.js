const User = require("../models/Users");

// Create a new user (by superadmin or admin)
const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!["student", "professor"].includes(role)) {
    return res.status(400).json({ message: "Invalid user role" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      username,
      email,
      password, // Hashed in schema
      role,
      isApproved: true, // Created users are auto-approved by admin/superadmin
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users (excluding superadmin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["student", "professor"] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { username, email, role } = req.body;

  if (role && !["student", "professor"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role === "superadmin") {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role === "superadmin") {
      return res.status(404).json({ message: "User not found" });
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search user by email (partial match, case-insensitive)
const searchUser = async (req, res) => {
  try {
    const searchQuery = req.params.search || "";

    const users = await User.find({
      role: { $in: ["student", "professor"] },
      email: { $regex: searchQuery, $options: "i" },
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  searchUser,
};
