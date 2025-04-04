const User = require("../models/Users");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!["admin", "student", "professor"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      isApproved: false,
    });
    res.status(201).json({ message: "Registration submitted for approval" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password matches using the model's method
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if the account is approved (except for superadmin)
    if (user.role !== "superadmin" && !user.isApproved) {
      return res.status(403).json({ message: "Account not approved yet" });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user details and token
    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: `Bearer ${token}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const approveAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    user.isApproved = true;
    await user.save();
    res.json({ message: "Admin approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !["student", "professor"].includes(user.role)) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isApproved = true;
    await user.save();
    res.json({ message: `${user.role} approved successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerUser, loginUser, approveAdmin, approveUser };
