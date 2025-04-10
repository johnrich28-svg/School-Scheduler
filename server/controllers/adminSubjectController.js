const Subject = require("../models/Subjects");
const Course = require("../models/Courses");
const YearLevel = require("../models/YearLevel");
const mongoose = require("mongoose");
// Create a new Subject
const createSubject = async (req, res) => {
  const { subjectCode, subjectName, courseId, yearLevelId, units } = req.body;

  if (!subjectCode || !subjectName || !courseId || !yearLevelId || !units) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: "Course not found" });
    }

    // Check if the year level exists
    const yearLevel = await YearLevel.findById(yearLevelId);
    if (!yearLevel) {
      return res.status(400).json({ message: "Year level not found" });
    }

    // 🔒 Check if subjectCode or subjectName already exists
    const existingSubject = await Subject.findOne({
      $or: [{ subjectCode: subjectCode }, { subjectName: subjectName }],
    });

    if (existingSubject) {
      return res.status(400).json({
        message: "Subject with the same code or name already exists",
      });
    }

    // Create new subject
    const subject = new Subject({
      subjectCode,
      subjectName,
      courseId,
      yearLevelId,
      units,
    });

    await subject.save();
    res.status(201).json({ message: "Subject created successfully", subject });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all Subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("courseId", "courseName")
      .populate("yearLevelId", "level"); // Populate courseId and yearLevelId fields
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Subject
const updateSubject = async (req, res) => {
  const { subjectCode, subjectName, courseId, yearLevelId, units } = req.body;

  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Validate and assign courseId if provided
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      subject.courseId = courseId;
    }

    // Validate and assign yearLevelId if provided
    if (yearLevelId) {
      const year = await Year.findById(yearLevelId);
      if (!year) {
        return res.status(400).json({ message: "Invalid year level ID" });
      }
      subject.yearLevelId = yearLevelId;
    }

    // Update other fields if provided
    if (subjectCode !== undefined) subject.subjectCode = subjectCode;
    if (subjectName !== undefined) subject.subjectName = subjectName;
    if (units !== undefined) subject.units = units;

    await subject.save();
    res.json({ message: "Subject updated successfully", subject });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Subject
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Use deleteOne instead of remove
    await subject.deleteOne();
    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search Subjects by subjectCode, subjectName, or _id
const searchSubjects = async (req, res) => {
  try {
    const searchQuery = req.params.search?.trim();

    if (!searchQuery) {
      return res.status(400).json({ message: "Search parameter is required." });
    }

    const isValidObjectId = mongoose.Types.ObjectId.isValid(searchQuery);

    const query = {
      $or: [
        { subjectName: { $regex: searchQuery, $options: "i" } },
        { subjectCode: { $regex: searchQuery, $options: "i" } },
      ],
    };

    if (isValidObjectId) {
      query.$or.push({ _id: searchQuery });
    }

    const subjects = await Subject.find(query)
      .populate("courseId", "courseName")
      .populate("yearLevelId", "level");

    if (subjects.length === 0) {
      return res.status(404).json({ message: "No subjects found" });
    }

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  searchSubjects,
};
