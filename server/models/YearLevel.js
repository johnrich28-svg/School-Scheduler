const mongoose = require("mongoose");

const yearSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ["1st", "2nd", "3rd", "4th"],
    unique: true, // so you don't create duplicate years
  },
});

const Year = mongoose.model("Year", yearSchema);
module.exports = Year;
