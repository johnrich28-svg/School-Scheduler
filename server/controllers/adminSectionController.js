const Section = require("../models/Sections");
const Course = require("../models/Courses");

// Create a new Section
const createSection = async (req, res) => {
  const { name, courseId, order, capacity } = req.body;

  if (!name || !courseId || !capacity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: "Course not found" });
    }

    // Check if the section name already exists for the same course (duplicate check)
    const existingSection = await Section.findOne({ name, courseId });
    if (existingSection) {
      return res
        .status(400)
        .json({ message: "Section name already exists for this course" });
    }

    // Create new section
    const section = new Section({
      name,
      courseId,
      order: order || 0, // Default order is 0
      capacity, // Set the capacity (max students)
    });

    await section.save();
    res.status(201).json({ message: "Section created successfully", section });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all Sections
const getSections = async (req, res) => {
  try {
    const sections = await Section.find().populate("courseId", "course"); // Populate courseId field
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Section
const updateSection = async (req, res) => {
  const { name, courseId, order, capacity } = req.body;

  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Optionally update fields if provided
    section.name = name || section.name;
    section.courseId = courseId || section.courseId;
    section.order = order || section.order;
    section.capacity = capacity || section.capacity;

    await section.save();
    res.json({ message: "Section updated successfully", section });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Section
const deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Use deleteOne instead of remove
    await section.deleteOne();
    res.json({ message: "Section deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search Sections (by course or name)
const searchSections = async (req, res) => {
  try {
    const searchQuery = req.params.search || "";

    const sections = await Section.find({
      name: { $regex: searchQuery, $options: "i" }, // Partial match for section name
    }).populate("courseId", "course");

    if (sections.length === 0) {
      return res.status(404).json({ message: "No sections found" });
    }

    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createSection,
  getSections,
  updateSection,
  deleteSection,
  searchSections,
};
