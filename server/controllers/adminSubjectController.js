const Subject = require("../models/Subjects");
const Course = require("../models/Courses");
const YearLevel = require("../models/YearLevel");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

// Create a new Subject
const createSubject = asyncHandler(async (req, res) => {
  const { subjectCode, subjectName, courseId, yearLevelId, semester, units, startTime, endTime, day } = req.body;

  // Validate required fields
  if (!subjectCode || !subjectName || !courseId || !yearLevelId || !semester || !units || !startTime || !endTime || !day) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Validate semester
  if (!["1st", "2nd"].includes(semester)) {
    res.status(400);
    throw new Error("Invalid semester value");
  }

  // Check if subject code already exists
  const subjectExists = await Subject.findOne({ subjectCode });
  if (subjectExists) {
    res.status(400);
    throw new Error("Subject code already exists");
  }

  // Check if the course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(400);
    throw new Error("Course not found");
  }

  // Check if the year level exists
  const yearLevel = await YearLevel.findById(yearLevelId);
  if (!yearLevel) {
    res.status(400);
    throw new Error("Year level not found");
  }

  // Create subject
  const subject = await Subject.create({
    subjectCode,
    subjectName,
    courseId,
    yearLevelId,
    semester,
    units,
    startTime,
    endTime,
    day,
  });

  if (subject) {
    res.status(201).json(subject);
  } else {
    res.status(400);
    throw new Error("Invalid subject data");
  }
});

// Get all Subjects
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find()
    .populate({
      path: 'courseId',
      select: 'course',
      model: 'Course'
    })
    .populate({
      path: 'yearLevelId',
      select: 'name',
      model: 'YearLevel'
    });
  
  if (!subjects) {
    res.status(404);
    throw new Error("No subjects found");
  }
  
  res.json(subjects);
});

// Update Subject
const updateSubject = asyncHandler(async (req, res) => {
  const { subjectCode, subjectName, courseId, yearLevelId, semester, units, startTime, endTime, day } = req.body;

  // Validate required fields
  if (!subjectCode || !subjectName || !courseId || !yearLevelId || !semester || !units || !startTime || !endTime || !day) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Validate semester
  if (!["1st", "2nd"].includes(semester)) {
    res.status(400);
    throw new Error("Invalid semester value");
  }

  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  // Check if subject code already exists (excluding current subject)
  const subjectExists = await Subject.findOne({
    subjectCode,
    _id: { $ne: req.params.id },
  });

  if (subjectExists) {
    res.status(400);
    throw new Error("Subject code already exists");
  }

  subject.subjectCode = subjectCode;
  subject.subjectName = subjectName;
  subject.courseId = courseId;
  subject.yearLevelId = yearLevelId;
  subject.semester = semester;
  subject.units = units;
  subject.startTime = startTime;
  subject.endTime = endTime;
  subject.day = day;

  const updatedSubject = await subject.save();
  res.json(updatedSubject);
});

// Delete Subject
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

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
      .populate("courseId", "course")
      .populate("yearLevelId", "name");

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
