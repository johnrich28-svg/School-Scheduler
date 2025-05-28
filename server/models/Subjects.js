const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subjectCode: String,
  subjectName: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  yearLevelId: { type: mongoose.Schema.Types.ObjectId, ref: "YearLevel" },
  timeSlotId: {type: mongoose.Schema.Types.ObjectId, ref: "TimeSlot"},
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  units: Number,
});

module.exports = mongoose.model("Subject", subjectSchema);
