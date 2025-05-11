const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  room: {
    type: String,
    trim: true,
  },
});

// Create the Room model
const Room = mongoose.model("Room", roomSchema);

// Export the model
module.exports = Room;
