const mongoose = require("mongoose");
const Course = require("../models/Courses");
const Section = require("../models/Sections");
const Subject = require("../models/Subjects");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");

// JWT Token Generator
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

/**
 * Register User - Admin, Student, or Professor (Pending Approval)
 */
const registerUser = async (req, res) => {
  const {
    username,
    email,
    password,
    role,
    courseId,
    sectionId,
    semester,
    studentType,
    passedSubjects,
    requestedSubjects,
    preferredSubjects,
  } = req.body;

  if (!["admin", "student", "professor"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      username,
      email,
      password,
      role,
      isApproved: false,
    });

    const isValidObjectId = mongoose.Types.ObjectId.isValid;

    // ----- Student Validation -----
    if (role === "student") {
      if (!["regular", "irregular"].includes(studentType)) {
        return res.status(400).json({ message: "Invalid student type" });
      }

      newUser.studentType = studentType;

      if (studentType === "regular") {
        if (!courseId || !sectionId || !semester) {
          return res.status(400).json({
            message:
              "Course, Section, and Semester are required for regular students",
          });
        }

        if (!isValidObjectId(courseId)) {
          return res.status(400).json({ message: "Invalid Course ID format" });
        }

        if (!isValidObjectId(sectionId)) {
          return res.status(400).json({ message: "Invalid Section ID format" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }

        const section = await Section.findById(sectionId);
        if (!section) {
          return res.status(404).json({ message: "Section not found" });
        }

        newUser.courseId = courseId;
        newUser.sectionId = sectionId;
        newUser.semester = semester;
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

        newUser.passedSubjects = passedSubjects;
        newUser.requestedSubjects = requestedSubjects;
      }
    }

    // ----- Professor Validation -----
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

      newUser.preferredSubjects = preferredSubjects;
    }

    await newUser.save();

    res.status(201).json({ message: "Registration submitted for approval" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Login User
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if the password matches
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if account is approved (except superadmin)
    if (user.role !== "superadmin" && !user.isApproved) {
      return res.status(403).json({ message: "Account not approved yet" });
    }

    // Populate specific fields based on role
    if (user.role === "student") {
      // Regular and Irregular students will have different data
      if (user.studentType === "regular") {
        user = await user.populate([
          { path: "courseId", select: "courseName courseCode" },
          { path: "sectionId", select: "sectionName" },
        ]);
      } else if (user.studentType === "irregular") {
        user = await user.populate([
          { path: "requestedSubjects", select: "subjectName subjectCode" },
          { path: "passedSubjects", select: "subjectName subjectCode" },
        ]);
      }
    } else if (user.role === "professor") {
      // Populate professor-specific data
      user = await user.populate([
        { path: "preferredSubjects", select: "subjectName subjectCode" },
      ]);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Construct the user data to send in response
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: `Bearer ${token}`,
    };

    // Add role-specific data
    if (user.role === "student") {
      userData.courseId = user.courseId;
      userData.sectionId = user.sectionId;
      if (user.studentType === "irregular") {
        userData.passedSubjects = user.passedSubjects;
        userData.requestedSubjects = user.requestedSubjects;
      }
    } else if (user.role === "professor") {
      userData.profAvail = user.profAvail;
      userData.preferredSubjects = user.preferredSubjects;
    }

    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Superadmin approves admin
 */
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

/**
 * Admin approves student or professor
 */
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

module.exports = {
  registerUser,
  loginUser,
  approveAdmin,
  approveUser,
};
