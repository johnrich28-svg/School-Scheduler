const Courses = require("../../models/Courses");
const Sections = require("../../models/Sections");
const YearLevel = require("../../models/YearLevel");
const Subject = require("../../models/Subjects");

const mongoose = require("mongoose");

// ✅ Get all courses (e.g., BSIT, BSCS)
const getCourses = async (req, res) => {
  try {
    const courses = await Courses.find({}, "_id course").sort({ course: 1 });
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Server error while fetching courses." });
  }
};

// ✅ Get all year levels (e.g., 1st Year, 2nd Year...)
const getYearLevels = async (req, res) => {
  try {
    const years = await YearLevel.find({}, { name: 1, _id: 0 }).sort({
      name: 1,
    });
    console.log("Fetched years:", years);
    res.status(200).json(years); // → [{ name: "1st" }, { name: "2nd" }, ...]
  } catch (error) {
    console.error("Error fetching year levels:", error.message);
    res
      .status(500)
      .json({ message: "Server error while fetching year levels." });
  }
};

// ✅ Get all sections (e.g., "BSIT - 1A")
const getAllSections = async (req, res) => {
  try {
    const sections = await Sections.find({}, "name").sort({ name: 1 });
    res.status(200).json(sections);
  } catch (error) {
    console.error("Error fetching all sections:", error);
    res.status(500).json({ message: "Server error while fetching sections." });
  }
};

// ✅ Get all subjects (optionally filtered by courseId and/or yearLevelId)
const getSubjects = async (req, res) => {
  try {
    const { courseId, yearLevelId } = req.query;

    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (yearLevelId) filter.yearLevelId = yearLevelId;

    const subjects = await Subject.find(filter)
      .populate("courseId", "course") // ref: "Course"
      .populate("yearLevelId", "name") // ref: "YearLevel"
      .select("subjectCode subjectName units courseId yearLevelId")
      .sort({ subjectName: 1 });

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error.message);
    res.status(500).json({ message: "Server error while fetching subjects." });
  }
};

module.exports = {
  getCourses,
  getYearLevels,
  getAllSections,
  getSubjects,
};
