const mongoose = require("mongoose");
const User = require("../models/Users");
const Section = require("../models/Sections");

// Create a new user (by superadmin or admin)
const createUser = async (req, res) => {
  const {
    username,
    email,
    password,
    role,
    studentType,
    courseId,
    sectionId,
    semester,
    passedSubjects,
    requestedSubjects,
    preferredSubjects,
  } = req.body;

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
      password,
      role,
      isApproved: true,
    });

    // 🔍 Handle student-specific fields
    if (role === "student") {
      if (!["regular", "irregular"].includes(studentType)) {
        return res.status(400).json({ message: "Invalid student type" });
      }

      user.studentType = studentType;

      if (studentType === "regular") {
        if (!courseId || !sectionId || !semester) {
          return res.status(400).json({
            message:
              "Course ID, Section ID, and Semester are required for regular students",
          });
        }

        user.courseId = courseId;
        user.sectionId = sectionId;
        user.semester = semester;
      }

      if (studentType === "irregular") {
        if (!passedSubjects || !Array.isArray(passedSubjects)) {
          return res.status(400).json({
            message: "Passed subjects are required for irregular students",
          });
        }
        if (!requestedSubjects || !Array.isArray(requestedSubjects)) {
          return res.status(400).json({
            message: "Requested subjects are required for irregular students",
          });
        }

        user.passedSubjects = passedSubjects;
        user.requestedSubjects = requestedSubjects;
      }
    }

    // 🔍 Handle professor-specific fields
    if (role === "professor") {
      if (
        !preferredSubjects ||
        !Array.isArray(preferredSubjects) ||
        preferredSubjects.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Preferred subjects are required for professors" });
      }
      user.preferredSubjects = preferredSubjects;
    }

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users (excluding superadmin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["student", "professor", "admin"] },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { username, email, role, sectionId } = req.body;

  // Validate role if provided
  if (role && !["student", "professor"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // Ensure the provided ID is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  // Check if sectionId is provided and is valid
  if (sectionId && !mongoose.Types.ObjectId.isValid(sectionId)) {
    return res.status(400).json({ message: "Invalid section ID format" });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role === "superadmin") {
      return res.status(404).json({ message: "User not found" });
    }

    // If a section ID is provided, check if the section exists
    if (sectionId) {
      const section = await Section.findById(sectionId);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }

      // Update the user's section (assuming you have a field in User schema for section)
      user.sectionId = sectionId;
    }

    // Update other fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();
    res.json({ message: "User updated successfully", user });
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

    // Ensure that the search query is at the start of the email, case-insensitive
    const regex = new RegExp(`^${searchQuery}`, "i"); // ^ means the search is from the start

    const users = await User.find({
      role: { $in: ["student", "professor", "admin"] },
      email: { $regex: regex },
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
