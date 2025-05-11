const Room = require("../models/Room");

// CREATE Room
const createRooms = async (req, res) => {
  try {
    const { room } = req.body;

    if (!room) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const existingRoom = await Room.findOne({ room });
    if (existingRoom) {
      return res.status(409).json({ message: "Room already exists" });
    }

    const newRoom = new Room({ room });
    await newRoom.save();

    res
      .status(201)
      .json({ message: "Room created successfully", room: newRoom });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET all Rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ room: 1 }); // optional sorting
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE Room
const deleteRooms = async (req, res) => {
  try {
    const roomId = req.params.id;

    const deletedRoom = await Room.findByIdAndDelete(roomId);

    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createRooms,
  getRooms,
  deleteRooms,
};
