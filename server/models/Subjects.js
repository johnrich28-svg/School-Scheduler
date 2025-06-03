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
  // ❌ REMOVE THIS - day should be flexible, determined during scheduling
  // day: {
  //   type: String,
  //   enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  //   required: true,
  // },
  units: Number,
  // ✅ ADD: Optional constraints if needed
  preferredDays: [{
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  }], // Optional: if subject has preferred days but not locked to one
  hoursPerWeek: {
    type: Number,
    default: function() {
      return this.units || 3; // Default based on units
    }
  }
});

module.exports = mongoose.model("Subject", subjectSchema);