const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  course: {
    type: String,
    enum: ["BSIT", "BSCS"],
    required: true,
  },
});

module.exports = mongoose.model("Course", courseSchema);
