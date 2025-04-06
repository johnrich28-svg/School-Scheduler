const Years = require("../models/Years");

// CREATE Year
const createYear = async (req, res) => {
  const { name } = req.body;

  if (!["1st", "2nd", "3rd", "4th"].includes(name)) {
    return res.status(400).json({ message: "Invalid year name" });
  }

  try {
    const existingYear = await Years.findOne({ name });
    if (existingYear) {
      return res.status(400).json({ message: "Year already exists" });
    }

    const year = await Years.create({ name });
    res.status(201).json({ message: "Year created successfully", year });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// READ - Get All Years
const getAllYears = async (req, res) => {
  try {
    const years = await Years.find().sort({ name: 1 });
    res.json(years);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE Year
const updateYear = async (req, res) => {
  const { name } = req.body;

  if (!["1st", "2nd", "3rd", "4th"].includes(name)) {
    return res.status(400).json({ message: "Invalid year name" });
  }

  try {
    const year = await Years.findById(req.params.id);
    if (!year) {
      return res.status(404).json({ message: "Year not found" });
    }

    // Avoid duplicate names
    const duplicate = await Years.findOne({ name });
    if (duplicate && duplicate._id.toString() !== req.params.id) {
      return res.status(400).json({ message: "Year name already taken" });
    }

    year.name = name;
    await year.save();

    res.json({ message: "Year updated successfully", year });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE Year
const deleteYear = async (req, res) => {
  try {
    const year = await Years.findById(req.params.id);
    if (!year) {
      return res.status(404).json({ message: "Year not found" });
    }

    await Years.deleteOne({ _id: req.params.id });
    res.json({ message: "Year deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// SEARCH Years by name
const searchYears = async (req, res) => {
  const { name } = req.query;

  try {
    const regex = new RegExp(name, "i");
    const years = await Years.find({ name: regex });

    res.json(years);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createYear,
  getAllYears,
  updateYear,
  deleteYear,
  searchYears,
};
