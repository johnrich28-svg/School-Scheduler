const Schedule = require("../models/Schedule");
const Subject = require("../models/Subjects");
const Section = require("../models/Sections");
const TimeSlot = require("../models/TimeSlot");
const User = require("../models/Users");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

// Time slots configuration
const TIME_SLOTS = [
  { start: "08:00", end: "11:00" },  // 3 hours
  { start: "11:00", end: "14:00" },  // 3 hours
  { start: "14:00", end: "17:00" }   // 3 hours
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper function to check if a time slot is valid
const isValidTimeRange = (startTime, endTime) => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  const minTime = new Date(`2000-01-01 08:00`);
  const maxTime = new Date(`2000-01-01 17:00`);
  return start >= minTime && end <= maxTime;
};

// Helper function to check for conflicts in a section
const hasConflict = async (sectionId, day, startTime, endTime, semester, academicYear = null, roomId = null) => {
  try {
    // First get the section details to check course and year
    const section = await Section.findById(sectionId).populate('courseId yearId');
    if (!section) {
      console.error('Section not found:', sectionId);
      return true;
    }

    // Find all sections in the same course and year
    const relatedSections = await Section.find({
      courseId: section.courseId._id,
      yearId: section.yearId._id
    });

    // Get all section IDs that are NOT in the same course and year
    const unrelatedSectionIds = await Section.find({
      $or: [
        { courseId: { $ne: section.courseId._id } },
        { yearId: { $ne: section.yearId._id } }
      ]
    }).select('_id');

    // Build the query for checking conflicts
    const conflictQuery = {
      sectionId: { $in: unrelatedSectionIds },
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
    };

    // Add academicYear to query if provided
    if (academicYear) {
      conflictQuery.academicYear = academicYear;
    }

    // Add roomId to query if provided (room conflicts)
    if (roomId) {
      conflictQuery.roomId = roomId;
    }

    // Check for conflicts only with unrelated sections
    const existingSchedule = await Schedule.findOne(conflictQuery);

    return !!existingSchedule;
  } catch (error) {
    console.error('Error checking for conflicts:', error);
    return true; // Assume conflict if there's an error
  }
};

// Helper function to get daily load for a section
const getDailyLoad = async (sectionId, day, semester, academicYear = null) => {
  try {
    const section = await Section.findById(sectionId).populate('courseId yearId');
    if (!section) return 0;

    // Get all sections in the same course and year
    const relatedSections = await Section.find({
      courseId: section.courseId._id,
      yearId: section.yearId._id
    });

    // Build query
    const query = {
      sectionId: { $in: relatedSections.map(s => s._id) },
      day,
      semester
    };

    if (academicYear) {
      query.academicYear = academicYear;
    }

    // Calculate total hours for all related sections
    const schedules = await Schedule.find(query);
    
    let totalHours = 0;
    for (const schedule of schedules) {
      const start = new Date(`2000-01-01 ${schedule.startTime}`);
      const end = new Date(`2000-01-01 ${schedule.endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      totalHours += hours;
    }
    return totalHours;
  } catch (error) {
    console.error('Error calculating daily load:', error);
    return 0;
  }
};

// Helper function to get subject hours for a section
const getSubjectHours = async (sectionId, subjectId, semester, academicYear = null) => {
  const query = {
    sectionId,
    subjectId,
    semester
  };

  if (academicYear) {
    query.academicYear = academicYear;
  }

  const schedules = await Schedule.find(query);
  
  let totalHours = 0;
  for (const schedule of schedules) {
    const start = new Date(`2000-01-01 ${schedule.startTime}`);
    const end = new Date(`2000-01-01 ${schedule.endTime}`);
    const hours = (end - start) / (1000 * 60 * 60);
    totalHours += hours;
  }
  return totalHours;
};

// Helper function to check for professor conflicts
const hasProfessorConflict = async (professorId, day, startTime, endTime, semester, academicYear = null) => {
  const query = {
    professorId,
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
  };

  if (academicYear) {
    query.academicYear = academicYear;
  }

  const existingSchedule = await Schedule.findOne(query);
  return !!existingSchedule;
};

// Helper function to get professor's preferred sections
const getProfessorPreferredSections = async (professorId) => {
  const professor = await User.findOne({ _id: professorId, role: "professor" });
  return professor?.preferredSections || [];
};

// Helper function to find available professor for a section
const findAvailableProfessor = async (sectionId, day, startTime, endTime, semester, academicYear = null) => {
  const professors = await User.find({ role: "professor" });
  
  for (const professor of professors) {
    const preferredSections = professor.preferredSections || [];
    if (!preferredSections.includes(sectionId)) continue;

    const hasConflict = await hasProfessorConflict(
      professor._id,
      day,
      startTime,
      endTime,
      semester,
      academicYear
    );

    if (!hasConflict) {
      return professor._id;
    }
  }
  return null;
};

// Helper function to create time slots with cycling capability
const createTimeSlots = () => {
  const slots = [];
  for (const day of DAYS) {
    for (const slot of TIME_SLOTS) {
      slots.push({
        day,
        startTime: slot.start,
        endTime: slot.end,
        available: true
      });
    }
  }
  return slots;
};

// Helper function to check if a schedule would violate the unique constraint
const wouldViolateUniqueConstraint = async (day, startTime, endTime, semester, academicYear = null, roomId = null) => {
  const query = {
    day,
    startTime,
    endTime,
    semester
  };

  // The unique constraint includes roomId and academicYear
  // If these are null, we need to check for existing null values
  if (roomId) {
    query.roomId = roomId;
  } else {
    query.roomId = { $in: [null, undefined] };
  }

  if (academicYear) {
    query.academicYear = academicYear;
  } else {
    query.academicYear = { $in: [null, undefined] };
  }

  const existingSchedule = await Schedule.findOne(query);
  return !!existingSchedule;
};

// Generate schedules for all sections or a specific section
const generateSchedules = async (req, res) => {
  try {
    const { sectionId, semester, academicYear } = req.body;
    console.log('Generating schedules with params:', { sectionId, semester, academicYear });

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Clear existing schedules for the selected section and semester
    const clearQuery = {};
    if (sectionId) clearQuery.sectionId = sectionId;
    if (semester) clearQuery.semester = semester;
    if (academicYear) clearQuery.academicYear = academicYear;
    
    const deletedCount = await Schedule.deleteMany(clearQuery);
    console.log(`Cleared ${deletedCount.deletedCount} existing schedules`);

    // Get all sections (filtered by sectionId if provided)
    const sections = sectionId 
      ? await Section.find({ _id: sectionId }).populate("courseId yearId")
      : await Section.find().populate("courseId yearId");

    if (!sections.length) {
      return res.status(404).json({ message: "No sections found" });
    }

    console.log('Found sections:', sections.map(s => ({
      name: s.name,
      course: s.courseId.course,
      year: s.yearId.name,
      courseId: s.courseId._id,
      yearId: s.yearId._id
    })));

    const schedulingReport = {
      totalSections: sections.length,
      sectionsProcessed: 0,
      totalSubjects: 0,
      subjectsScheduled: 0,
      errors: []
    };

    // Group sections by course and year
    const sectionGroups = {};
    for (const section of sections) {
      const key = `${section.courseId._id}-${section.yearId._id}`;
      if (!sectionGroups[key]) {
        sectionGroups[key] = {
          course: section.courseId.course,
          year: section.yearId.name,
          courseId: section.courseId._id,
          yearId: section.yearId._id,
          sections: []
        };
      }
      sectionGroups[key].sections.push(section);
    }

    console.log('Section groups:', Object.entries(sectionGroups).map(([key, group]) => ({
      key,
      course: group.course,
      year: group.year,
      courseId: group.courseId,
      yearId: group.yearId,
      sections: group.sections.map(s => s.name)
    })));

    // Process each group of sections
    for (const [key, group] of Object.entries(sectionGroups)) {
      try {
        console.log(`\nProcessing group: ${group.course} - ${group.year}`);
        console.log(`Sections in group: ${group.sections.map(s => s.name).join(', ')}`);

        // Get subjects for this course and year level
        const subjects = await Subject.find({
          courseId: group.courseId,
          yearLevelId: group.yearId,
          semester: semester
        });

        console.log(`Found ${subjects.length} subjects for ${group.course} ${group.year}:`, 
          subjects.map(s => s.subjectCode));

        if (!subjects.length) {
          schedulingReport.errors.push(`No subjects found for ${group.course} ${group.year} in ${semester} semester`);
          continue;
        }

        schedulingReport.totalSubjects += subjects.length * group.sections.length;

        // Sort subjects by units (descending)
        subjects.sort((a, b) => b.units - a.units);

        const baseSlots = createTimeSlots(); // This creates the template slots

        // Process each section in the group
        for (const section of group.sections) {
          console.log(`\nProcessing section: ${section.name}`);
          
          let sectionSubjectsScheduled = 0;
          // Each section starts from slot 0 - they can use the same time slots
          let sectionSlotIndex = 0;

          // Schedule each subject for this section with week wrapping
          for (const subject of subjects) {
            console.log(`\nScheduling ${subject.subjectCode} for ${section.name}`);
            
            let scheduledSuccessfully = false;
            let attempts = 0;
            const maxAttempts = baseSlots.length * 4; // Allow checking multiple weeks
            
            while (!scheduledSuccessfully && attempts < maxAttempts) {
              // Get the current slot (cycling through the week)
              const slotIndex = sectionSlotIndex % baseSlots.length;
              const currentSlot = baseSlots[slotIndex];
              
              // Check if this would violate the unique constraint
              const wouldViolateConstraint = await wouldViolateUniqueConstraint(
                currentSlot.day,
                currentSlot.startTime,
                currentSlot.endTime,
                semester,
                academicYear
              );

              if (wouldViolateConstraint) {
                console.log(`Would violate unique constraint for ${subject.subjectCode} in ${section.name} on ${currentSlot.day} ${currentSlot.startTime}-${currentSlot.endTime}`);
                sectionSlotIndex++;
                attempts++;
                continue;
              }

              // Check for conflicts with this specific section
              const hasTimeConflict = await hasConflict(
                section._id,
                currentSlot.day,
                currentSlot.startTime,
                currentSlot.endTime,
                semester,
                academicYear
              );

              if (!hasTimeConflict) {
                try {
                  // Create and save the schedule
                  const scheduleData = {
                    sectionId: section._id,
                    subjectId: subject._id,
                    day: currentSlot.day,
                    startTime: currentSlot.startTime,
                    endTime: currentSlot.endTime,
                    semester
                  };

                  // Add academicYear if provided
                  if (academicYear) {
                    scheduleData.academicYear = academicYear;
                  }

                  const newSchedule = new Schedule(scheduleData);
                  await newSchedule.save();
                  
                  const weekNum = Math.floor(sectionSlotIndex / baseSlots.length);
                  const weekInfo = weekNum > 0 ? ` (Week ${weekNum + 1})` : '';
                  console.log(`Successfully scheduled ${subject.subjectCode} for ${section.name} on ${currentSlot.day} ${currentSlot.startTime}-${currentSlot.endTime}${weekInfo}`);
                  
                  // Move to next slot for the next subject
                  sectionSlotIndex++;
                  
                  scheduledSuccessfully = true;
                  sectionSubjectsScheduled++;
                  schedulingReport.subjectsScheduled++;
                  
                } catch (error) {
                  console.error(`Error saving schedule for ${section.name} - ${subject.subjectCode}:`, error);
                  
                  // Check if it's a duplicate key error
                  if (error.code === 11000) {
                    console.log(`Duplicate key error - skipping this slot and trying next one`);
                    sectionSlotIndex++;
                  } else {
                    schedulingReport.errors.push(
                      `Failed to save schedule for ${section.name} - ${subject.subjectCode}: ${error.message}`
                    );
                    break;
                  }
                }
              } else {
                // Move to next slot if there's a conflict
                sectionSlotIndex++;
              }
              
              attempts++;
            }

            if (!scheduledSuccessfully) {
              console.log(`Could not schedule ${subject.subjectCode} for ${section.name} - no available slots after ${maxAttempts} attempts`);
              schedulingReport.errors.push(
                `No available slots for ${subject.subjectCode} in ${section.name} after checking multiple weeks`
              );
            }
          }

          console.log(`Completed scheduling for ${section.name}: ${sectionSubjectsScheduled} out of ${subjects.length} subjects scheduled`);
          schedulingReport.sectionsProcessed++;
        }

        console.log(`\nCompleted group ${group.course} - ${group.year}`);

      } catch (groupError) {
        console.error(`Error processing section group:`, groupError);
        schedulingReport.errors.push(
          `Error processing section group ${group.course} - ${group.year}: ${groupError.message}`
        );
      }
    }

    // Get all schedules after generation
    const query = {};
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;

    const schedules = await Schedule.find(query)
      .populate({
        path: "sectionId",
        populate: [
          { path: "courseId", select: "course" },
          { path: "yearId", select: "name" }
        ]
      })
      .populate({
        path: "subjectId",
        select: "subjectCode subjectName units"
      });

    console.log(`\nTotal schedules generated: ${schedules.length}`);
    console.log('Schedules by section:', 
      sections.map(s => ({
        name: s.name,
        course: s.courseId.course,
        year: s.yearId.name,
        schedules: schedules.filter(sch => sch.sectionId._id.toString() === s._id.toString()).length
      }))
    );

    // Calculate success rate
    const successRate = schedulingReport.totalSubjects > 0 
      ? (schedulingReport.subjectsScheduled / schedulingReport.totalSubjects) * 100
      : 0;
    
    // Return response with all necessary data
    res.json({
      message: successRate === 100 
        ? "All subjects scheduled successfully" 
        : `Scheduled ${schedulingReport.subjectsScheduled} out of ${schedulingReport.totalSubjects} subjects (${successRate.toFixed(1)}%)`,
      report: schedulingReport,
      schedules: schedules,
      success: true
    });

  } catch (error) {
    console.error("Error generating schedules:", error);
    res.status(500).json({ 
      message: "Error generating schedules",
      error: error.message,
      success: false
    });
  }
};

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