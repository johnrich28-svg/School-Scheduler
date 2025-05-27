const mongoose = require("mongoose");

const yearSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ["1st", "2nd", "3rd", "4th"],
    unique: true,
  },
});

// ✅ Explicitly use the "years" collection (not default "yearlevels")
const YearLevel = mongoose.model("YearLevel", yearSchema, "years");

module.exports = YearLevel;
