const Schedule = require("../models/Schedule");
const Subject = require("../models/Subjects");
const Section = require("../models/Sections");
const asyncHandler = require("express-async-handler");

// Time slots configuration
const TIME_SLOTS = [
  { start: "08:00", end: "11:00" },
  { start: "11:00", end: "14:00" },
  { start: "14:00", end: "17:00" },
];

// Generate schedules for all sections
const generateSchedules = asyncHandler(async (req, res) => {
  try {
    // Clear existing schedules
    await Schedule.deleteMany({});

    // Get all sections
    const sections = await Section.find({})
      .populate("courseId")
      .populate("yearId");

    // Get all subjects
    const subjects = await Subject.find({})
      .populate("courseId")
      .populate("yearLevelId");

    // Group subjects by semester
    const subjectsBySemester = {
      "1st": subjects.filter(subject => subject.semester === "1st"),
      "2nd": subjects.filter(subject => subject.semester === "2nd"),
    };

    const generatedSchedules = [];

    // Generate schedules for each section
    for (const section of sections) {
      // Get subjects for this section's course and year
      const sectionSubjects = subjects.filter(
        subject =>
          subject.courseId._id.toString() === section.courseId._id.toString() &&
          subject.yearLevelId._id.toString() === section.yearId._id.toString()
      );

      // Generate schedule for each semester
      for (const semester of ["1st", "2nd"]) {
        const semesterSubjects = sectionSubjects.filter(
          subject => subject.semester === semester
        );

        // Assign time slots for each subject
        for (const subject of semesterSubjects) {
          const day = subject.day; // Use the preferred day from subject
          
          // Find an available time slot
          for (const timeSlot of TIME_SLOTS) {
            // Check if this time slot is already taken
            const existingSchedule = await Schedule.findOne({
              sectionId: section._id,
              day,
              startTime: timeSlot.start,
              endTime: timeSlot.end,
            });

            if (!existingSchedule) {
              // Create new schedule
              const schedule = await Schedule.create({
                sectionId: section._id,
                subjectId: subject._id,
                day,
                startTime: timeSlot.start,
                endTime: timeSlot.end,
                semester,
              });

              generatedSchedules.push(schedule);
              break; // Move to next subject
            }
          }
        }
      }
    }

    res.status(201).json({
      message: "Schedules generated successfully",
      schedules: generatedSchedules,
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to generate schedules: ${error.message}`);
  }
});

// Get all schedules
const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find({})
    .populate({
      path: "sectionId",
      populate: [
        { path: "courseId", select: "course" },
        { path: "yearId", select: "name" },
      ],
    })
    .populate({
      path: "subjectId",
      select: "subjectCode subjectName units",
    });

  res.json(schedules);
});

// Get schedules by section
const getSchedulesBySection = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find({ sectionId: req.params.sectionId })
    .populate({
      path: "sectionId",
      populate: [
        { path: "courseId", select: "course" },
        { path: "yearId", select: "name" },
      ],
    })
    .populate({
      path: "subjectId",
      select: "subjectCode subjectName units",
    });

  res.json(schedules);
});

// Get schedules by semester
const getSchedulesBySemester = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find({ semester: req.params.semester })
    .populate({
      path: "sectionId",
      populate: [
        { path: "courseId", select: "course" },
        { path: "yearId", select: "name" },
      ],
    })
    .populate({
      path: "subjectId",
      select: "subjectCode subjectName units",
    });

  res.json(schedules);
});

// Delete all schedules
const deleteAllSchedules = asyncHandler(async (req, res) => {
  await Schedule.deleteMany({});
  res.json({ message: "All schedules deleted successfully" });
});

module.exports = {
  generateSchedules,
  getSchedules,
  getSchedulesBySection,
  getSchedulesBySemester,
  deleteAllSchedules,
}; 