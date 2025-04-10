const Section = require("../models/Sections");
const Course = require("../models/Courses");
const Year = require("../models/YearLevel"); // Assuming you have a Year model

// Create a new Section
const createSection = async (req, res) => {
  const { name, courseId, yearId, order, capacity } = req.body;

  if (!name || !courseId || !yearId || !capacity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: "Course not found" });
    }

    // Check if the year exists
    const year = await Year.findById(yearId);
    if (!year) {
      return res.status(400).json({ message: "Year not found" });
    }

    // Check if the section name already exists for the same course and year (duplicate check)
    const existingSection = await Section.findOne({ name, courseId, yearId });
    if (existingSection) {
      return res.status(400).json({
        message: "Section name already exists for this course and year",
      });
    }

    // Create new section
    const section = new Section({
      name,
      courseId,
      yearId, // Adding the year reference to the section
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
  const { name, courseId, yearId, order, capacity } = req.body;

  try {
    // Validate courseId if provided
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(400).json({ message: "Course not found" });
      }
    }

    // Validate yearId if provided
    if (yearId) {
      const year = await Year.findById(yearId);
      if (!year) {
        return res.status(400).json({ message: "Year not found" });
      }
    }

    // Safely update using $set
    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true, // return the updated document
        runValidators: true, // apply schema validation
        context: "query", // required for validators like max
      }
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json({
      message: "Section updated successfully",
      section: updatedSection,
    });
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
