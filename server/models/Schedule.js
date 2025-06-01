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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to prevent scheduling conflicts
scheduleSchema.index(
  { sectionId: 1, day: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

// ✅ Prevent model overwrite on hot reload
const Schedule = mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;
