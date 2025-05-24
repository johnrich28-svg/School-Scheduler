const Courses = require("../../models/Courses");
const Sections = require("../../models/Sections");
const YearLevel = require("../../models/YearLevel");

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
    // Fetch only the 'name' field, exclude '_id'
    const years = await YearLevel.find({}, "name -_id").sort({ name: 1 });
    res.status(200).json(years); // [{ name: "1st" }, { name: "2nd" }, ...]
  } catch (error) {
    console.error("Error fetching year levels:", error);
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

module.exports = {
  getCourses,
  getYearLevels,
  getAllSections,
};
