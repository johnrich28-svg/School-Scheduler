const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "BSIT - 1A"
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // References the Course model
    required: true, // You must assign a course to each section
  },
  yearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "YearLevel", // References the YearLevel model
    required: true, // You must assign a year to each section
  },
  order: {
    type: Number,
    default: 0,
  },
  capacity: {
    type: Number,
    required: true,
    default: 40,
    max: 40,
  },
});

module.exports = mongoose.model("Section", sectionSchema);
