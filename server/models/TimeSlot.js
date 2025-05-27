// models/TimeSlot.js
const mongoose = require("mongoose");

const TimeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    required: true,
  },
  startTime: {
    type: String,
    required: true, // Format: '08:00'
  },
  endTime: {
    type: String,
    required: true, // Format: '11:00'
  },
  sequence: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("TimeSlot", TimeSlotSchema);
