const Subject = require("../models/Subjects");
const Course = require("../models/Courses");
const YearLevel = require("../models/YearLevel");
const asyncHandler = require("express-async-handler");

// Create a new subject
const createSubject = asyncHandler(async (req, res) => {
  const { subjectCode, subjectName, courseId, yearLevelId, semester, units, day } = req.body;

  // Validate required fields
  if (!subjectCode || !subjectName || !courseId || !yearLevelId || !semester || !units || !day) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Check if course exists
  const courseExists = await Course.findById(courseId);
  if (!courseExists) {
    res.status(400);
    throw new Error("Course not found");
  }

  // Check if year level exists
  const yearExists = await YearLevel.findById(yearLevelId);
  if (!yearExists) {
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
    day,
  });

  if (subject) {
    res.status(201).json(subject);
  } else {
    res.status(400);
    throw new Error("Invalid subject data");
  }
});

// Get all subjects
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({})
    .populate("courseId", "course")
    .populate("yearLevelId", "name");
  res.json(subjects);
});

// Update a subject
const updateSubject = asyncHandler(async (req, res) => {
  const { subjectCode, subjectName, courseId, yearLevelId, semester, units, day } = req.body;

  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  // Check if course exists
  const courseExists = await Course.findById(courseId);
  if (!courseExists) {
    res.status(400);
    throw new Error("Course not found");
  }

  // Check if year level exists
  const yearExists = await YearLevel.findById(yearLevelId);
  if (!yearExists) {
    res.status(400);
    throw new Error("Year level not found");
  }

  subject.subjectCode = subjectCode || subject.subjectCode;
  subject.subjectName = subjectName || subject.subjectName;
  subject.courseId = courseId || subject.courseId;
  subject.yearLevelId = yearLevelId || subject.yearLevelId;
  subject.semester = semester || subject.semester;
  subject.units = units || subject.units;
  subject.day = day || subject.day;

  const updatedSubject = await subject.save();
  res.json(updatedSubject);
});

// Delete a subject
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  await subject.deleteOne();
  res.json({ message: "Subject removed" });
});

// Search subjects
const searchSubjects = asyncHandler(async (req, res) => {
  const searchQuery = req.params.search;
  const subjects = await Subject.find({
    $or: [
      { subjectCode: { $regex: searchQuery, $options: "i" } },
      { subjectName: { $regex: searchQuery, $options: "i" } },
    ],
  })
    .populate("courseId", "course")
    .populate("yearLevelId", "name");
  res.json(subjects);
});

module.exports = {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  searchSubjects,
};
