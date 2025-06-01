const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subjectCode: String,
  subjectName: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  yearLevelId: { type: mongoose.Schema.Types.ObjectId, ref: "YearLevel" },
  timeSlotId: {type: mongoose.Schema.Types.ObjectId, ref: "TimeSlot"},
  semester: {
    type: String,
    enum: ["1st", "2nd"],
    required: true,
  },
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    required: true,
  },
  units: Number,
});

module.exports = mongoose.model("Subject", subjectSchema);
