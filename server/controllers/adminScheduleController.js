const Schedule = require("../models/Schedule");
const Subject = require("../models/Subjects");
const Section = require("../models/Sections");
const TimeSlot = require("../models/TimeSlot");
const User = require("../models/Users");
const asyncHandler = require("express-async-handler");

// Time slots configuration
const TIME_SLOTS = [
  { start: "08:00", end: "11:00" },
  { start: "11:00", end: "14:00" },
  { start: "14:00", end: "17:00" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper function to validate time range
const isValidTimeRange = (startTime, endTime) => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  const minTime = new Date(`2000-01-01 08:00`);
  const maxTime = new Date(`2000-01-01 17:00`);

  return start >= minTime && end <= maxTime;
};

// Helper function to check for schedule conflicts
const hasScheduleConflict = async (sectionId, day, startTime, endTime, semester) => {
  const existingSchedule = await Schedule.findOne({
    sectionId,
    day,
    semester,
    $or: [
      {
        $and: [
          { startTime: { $lte: startTime } },
          { endTime: { $gt: startTime } }
        ]
      },
      {
        $and: [
          { startTime: { $lt: endTime } },
          { endTime: { $gte: endTime } }
        ]
      }
    ]
  });
  return !!existingSchedule;
};

// Helper function to check if subject is already scheduled
const isSubjectScheduled = async (subjectId, day, startTime, endTime, semester) => {
  const existingSchedule = await Schedule.findOne({
    subjectId,
    day,
    semester,
    $or: [
      {
        $and: [
          { startTime: { $lte: startTime } },
          { endTime: { $gt: startTime } }
        ]
      },
      {
        $and: [
          { startTime: { $lt: endTime } },
          { endTime: { $gte: endTime } }
        ]
      }
    ]
  });
  return !!existingSchedule;
};

// Generate schedules for all sections or a specific section
const generateSchedules = asyncHandler(async (req, res) => {
  try {
    const { sectionId } = req.body;

    // Step 1: Clear existing schedules
    if (sectionId) {
      await Schedule.deleteMany({ sectionId });
    } else {
      await Schedule.deleteMany({});
    }

    // Step 2: Fetch required data
    const sections = sectionId 
      ? await Section.find({ _id: sectionId }).populate("courseId").populate("yearId")
      : await Section.find({}).populate("courseId").populate("yearId");

    if (sections.length === 0) {
      return res.status(404).json({ message: "No sections found" });
    }

    const subjects = await Subject.find({})
      .populate("courseId")
      .populate("yearLevelId");

    const timeSlots = await TimeSlot.find().sort({ sequence: 1 });
    if (timeSlots.length === 0) {
      return res.status(400).json({ message: "No time slots found. Please create time slots first." });
    }

    // Filter time slots to only include those between 8 AM and 5 PM
    const validTimeSlots = timeSlots.filter(slot => 
      isValidTimeRange(slot.startTime, slot.endTime)
    );

    if (validTimeSlots.length === 0) {
      return res.status(400).json({ 
        message: "No valid time slots found. Please create time slots between 8 AM and 5 PM." 
      });
    }

    const generatedSchedules = [];
    const failedSchedules = [];

    // Step 3: Generate schedules for each section
    for (const section of sections) {
      const sectionSubjects = subjects.filter(subject =>
        subject.courseId?._id?.toString() === section.courseId?._id?.toString() &&
        subject.yearLevelId?._id?.toString() === section.yearId?._id?.toString()
      );

      const subjectsBySemester = {
        "1st": sectionSubjects.filter(subject => subject.semester === "1st"),
        "2nd": sectionSubjects.filter(subject => subject.semester === "2nd"),
      };

      const sectionSchedules = new Set();

      for (const semester of ["1st", "2nd"]) {
        const semesterSubjects = subjectsBySemester[semester];

        for (const subject of semesterSubjects) {
          let scheduled = false;

          // Use only valid time slots
          for (const timeSlot of validTimeSlots) {
            const slotKey = `${timeSlot.day}-${timeSlot.startTime}-${timeSlot.endTime}`;

            if (sectionSchedules.has(slotKey)) continue;

            try {
              const existingSchedule = await Schedule.findOne({
                day: timeSlot.day,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
                semester
              });

              if (existingSchedule) continue;

              const schedule = await Schedule.create({
                sectionId: section._id,
                subjectId: subject._id,
                day: timeSlot.day,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
                semester,
              });

              await Subject.findByIdAndUpdate(subject._id, {
                day: timeSlot.day,
                timeSlotId: timeSlot._id
              });

              generatedSchedules.push(schedule);
              sectionSchedules.add(slotKey);
              scheduled = true;
              break;
            } catch (err) {
              console.error(`Error creating schedule: ${err.message}`);
              continue;
            }
          }

          if (!scheduled) {
            failedSchedules.push({
              section: section.name,
              subject: subject.subjectCode,
              semester
            });
          }
        }
      }
    }

    res.status(201).json({
      message: sectionId 
        ? "✅ Schedule generated successfully for the specified section"
        : "✅ Schedules generated successfully for all sections",
      schedules: generatedSchedules,
      failedSchedules: failedSchedules.length > 0 ? failedSchedules : undefined
    });

  } catch (error) {
    console.error("❌ Schedule generation error:", error);
    res.status(500).json({
      message: "Failed to generate schedules",
      error: error.message,
    });
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
