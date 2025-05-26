const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subjectCode: String,
  subjectName: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  yearLevelId: { type: mongoose.Schema.Types.ObjectId, ref: "YearLevel" },
  units: Number,
});

module.exports = mongoose.model("Subject", subjectSchema);
