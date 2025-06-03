const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
      enum: ["1st", "2nd"],
    },
    academicYear: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add optimized compound index for faster queries
scheduleSchema.index({ sectionId: 1, semester: 1, academicYear: 1 });
scheduleSchema.index({ subjectId: 1, semester: 1 });
// Update the time slot index to include semester in the unique constraint
scheduleSchema.index({ sectionId: 1, day: 1, startTime: 1, endTime: 1, semester: 1 }, { unique: true });

const Schedule = mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;