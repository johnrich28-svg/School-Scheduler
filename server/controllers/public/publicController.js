const Courses = require("../../models/Courses");
const Sections = require("../../models/Sections");
const YearLevel = require("../../models/YearLevel");
const Subject = require("../../models/Subjects");
const TimeSlot = require("../../models/TimeSlot");

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

// ✅ Create a new time slot
const postTimeSlots = async (req, res) => {
  try {
    const { day, startTime, endTime, sequence } = req.body || {};

    console.log("Received data:", req.body);

    // Validate required fields
    if (
      !day ||
      ![
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ].includes(day) ||
      !startTime ||
      !endTime ||
      typeof sequence !== "number"
    ) {
      return res.status(400).json({
        message:
          "Invalid input. Required fields: day (Mon-Sat), startTime, endTime, sequence (number).",
      });
    }

    // Optional: Check if sequence for the same day already exists
    const existing = await TimeSlot.findOne({ day, sequence });
    if (existing) {
      return res.status(409).json({
        message: `TimeSlot with sequence ${sequence} on ${day} already exists.`,
      });
    }

    // Create and save new TimeSlot
    const newTimeSlot = new TimeSlot({
      day,
      startTime,
      endTime,
      sequence,
    });

    await newTimeSlot.save();

    return res.status(201).json({
      message: "TimeSlot created successfully.",
      data: newTimeSlot,
    });
  } catch (error) {
    console.error("Error creating TimeSlot:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

module.exports = {
  getCourses,
  getYearLevels,
  getAllSections,
  getSubjects,
  postTimeSlots,
};
