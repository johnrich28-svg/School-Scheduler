const Schedule = require("../models/Schedule");
const Subject = require("../models/Subjects");
const Section = require("../models/Sections");
const TimeSlot = require("../models/TimeSlot");
const User = require("../models/Users");
const asyncHandler = require("express-async-handler");

// Time slots configuration
const TIME_SLOTS = [
  { start: "08:00", end: "09:30" },
  { start: "09:30", end: "11:00" },
  { start: "11:00", end: "12:30" },
  { start: "13:00", end: "14:30" },
  { start: "14:30", end: "16:00" },
  { start: "16:00", end: "17:30" }
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper function to check if a time slot is valid
const isValidTimeRange = (startTime, endTime) => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  const minTime = new Date(`2000-01-01 08:00`);
  const maxTime = new Date(`2000-01-01 17:30`);
  return start >= minTime && end <= maxTime;
};

// Helper function to check for conflicts in a section
const hasConflict = async (sectionId, day, startTime, endTime, semester) => {
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

// Helper function to get daily load for a section
const getDailyLoad = async (sectionId, day, semester) => {
  const schedules = await Schedule.find({
    sectionId,
    day,
    semester
  });
  
  let totalHours = 0;
  for (const schedule of schedules) {
    const start = new Date(`2000-01-01 ${schedule.startTime}`);
    const end = new Date(`2000-01-01 ${schedule.endTime}`);
    const hours = (end - start) / (1000 * 60 * 60);
    totalHours += hours;
  }
  return totalHours;
};

// Helper function to get subject hours for a section
const getSubjectHours = async (sectionId, subjectId, semester) => {
  const schedules = await Schedule.find({
    sectionId,
    subjectId,
    semester
  });
  
  let totalHours = 0;
  for (const schedule of schedules) {
    const start = new Date(`2000-01-01 ${schedule.startTime}`);
    const end = new Date(`2000-01-01 ${schedule.endTime}`);
    const hours = (end - start) / (1000 * 60 * 60);
    totalHours += hours;
  }
  return totalHours;
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

    const generatedSchedules = [];
    const failedSchedules = [];

    // Step 3: Generate schedules for each section
    for (const section of sections) {
      console.log(`Processing section: ${section.name}`);
      
      // Get subjects for this section's course and year
      const sectionSubjects = subjects.filter(subject => 
        subject.courseId?._id?.toString() === section.courseId?._id?.toString() &&
        subject.yearLevelId?._id?.toString() === section.yearId?._id?.toString()
      );

      // Separate subjects by semester
      const subjectsBySemester = {
        "1st": sectionSubjects.filter(subject => subject.semester === "1st"),
        "2nd": sectionSubjects.filter(subject => subject.semester === "2nd"),
      };

      // Process each semester
      for (const semester of ["1st", "2nd"]) {
        const semesterSubjects = subjectsBySemester[semester];
        
        if (semesterSubjects.length === 0) {
          console.log(`No subjects found for ${semester} semester in section ${section.name}`);
          continue;
        }

        // Sort subjects by units (descending)
        semesterSubjects.sort((a, b) => b.units - a.units);

        // Create all possible time slots
        const allTimeSlots = [];
        for (const day of DAYS) {
          for (const timeSlot of TIME_SLOTS) {
            allTimeSlots.push({
              day,
              startTime: timeSlot.start,
              endTime: timeSlot.end
            });
          }
        }

        // Shuffle time slots to randomize scheduling
        for (let i = allTimeSlots.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allTimeSlots[i], allTimeSlots[j]] = [allTimeSlots[j], allTimeSlots[i]];
        }

        // Schedule each subject
        for (const subject of semesterSubjects) {
          let scheduled = false;
          const requiredHours = 3; // Fixed 3 hours per subject
          let scheduledHours = 0;
          let attempts = 0;
          const maxAttempts = 50; // Prevent infinite loops

          // Try to schedule the subject
          while (scheduledHours < requiredHours && attempts < maxAttempts) {
            attempts++;
            
            // Get current subject hours
            const currentSubjectHours = await getSubjectHours(section._id, subject._id, semester);
            if (currentSubjectHours >= requiredHours) {
              scheduled = true;
              break;
            }

            // Try each time slot
            for (const timeSlot of allTimeSlots) {
              const currentLoad = await getDailyLoad(section._id, timeSlot.day, semester);
              if (currentLoad >= 6) continue; // Skip if daily load is full

              const hasTimeConflict = await hasConflict(
                section._id,
                timeSlot.day,
                timeSlot.startTime,
                timeSlot.endTime,
                semester
              );

              if (!hasTimeConflict) {
                try {
                  const schedule = await Schedule.create({
                    sectionId: section._id,
                    subjectId: subject._id,
                    day: timeSlot.day,
                    startTime: timeSlot.startTime,
                    endTime: timeSlot.endTime,
                    semester,
                  });

                  generatedSchedules.push(schedule);
                  scheduledHours += 1.5; // Each slot is 1.5 hours
                  scheduled = true;
                  break; // Break after successful scheduling of one slot
                } catch (err) {
                  console.error(`Error creating schedule: ${err.message}`);
                }
              }
            }
          }

          if (!scheduled || scheduledHours < requiredHours) {
            failedSchedules.push({
              section: section.name,
              subject: subject.subjectCode,
              semester,
              units: subject.units,
              course: subject.courseId?.course,
              year: subject.yearLevelId?.name,
              scheduledHours,
              requiredHours
            });
          }
        }
      }
    }

    // Generate report
    const report = {
      totalSubjects: subjects.length,
      scheduledSubjects: generatedSchedules.length,
      failedSubjects: failedSchedules.length,
      failedSchedules: failedSchedules.length > 0 ? failedSchedules : undefined,
      semesterBreakdown: {
        "1st": {
          total: subjects.filter(s => s.semester === "1st").length,
          scheduled: generatedSchedules.filter(s => s.semester === "1st").length
        },
        "2nd": {
          total: subjects.filter(s => s.semester === "2nd").length,
          scheduled: generatedSchedules.filter(s => s.semester === "2nd").length
        }
      },
      sectionBreakdown: sections.map(section => ({
        section: section.name,
        course: section.courseId?.course,
        year: section.yearId?.name,
        totalSubjects: subjects.filter(s => 
          s.courseId?._id?.toString() === section.courseId?._id?.toString() &&
          s.yearLevelId?._id?.toString() === section.yearId?._id?.toString()
        ).length,
        scheduledSubjects: generatedSchedules.filter(s => 
          s.sectionId?.toString() === section._id.toString()
        ).length
      }))
    };

    res.status(201).json({
      message: sectionId 
        ? "✅ Schedule generated successfully for the specified section"
        : "✅ Schedules generated successfully for all sections",
      schedules: generatedSchedules,
      report: report
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
    })
    .sort({ semester: 1, day: 1, startTime: 1 });

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
