const Schedule = require("../models/Schedule");
const Subject = require("../models/Subjects");
const Section = require("../models/Sections");
const TimeSlot = require("../models/TimeSlot");
const asyncHandler = require("express-async-handler");

// Helper Functions
const getDuration = (start, end) => {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  return (endH - startH) + (endM - startM)/60;
};

const isTimeOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

const addHours = (time, hours) => {
  const [h, m] = time.split(':').map(Number);
  const newH = h + Math.floor(hours);
  const newM = m + ((hours % 1) * 60);
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

// Core Scheduling Function
const scheduleSubject = async (section, subject, semester, academicYear, globalOccupied) => {
  const requiredHours = subject.hoursPerWeek || Math.max(1, Math.ceil(subject.units));
  
  // Get all possible time slots from TimeSlot model
  const allTimeSlots = await TimeSlot.find().sort({ day: 1, startTime: 1 });
  
  // If subject has preferred days, filter slots to those days
  const preferredSlots = subject.preferredDays?.length 
    ? allTimeSlots.filter(slot => subject.preferredDays.includes(slot.day))
    : allTimeSlots;
  
  for (const slot of preferredSlots) {
    const slotDuration = getDuration(slot.startTime, slot.endTime);
    
    if (slotDuration >= requiredHours) {
      const endTime = addHours(slot.startTime, requiredHours);
      
      // Check global conflicts (other sections)
      const hasConflict = globalOccupied.some(occupied => 
        occupied.day === slot.day && 
        isTimeOverlap(slot.startTime, endTime, occupied.startTime, occupied.endTime)
      );
      
      if (hasConflict) continue;
      
      // Create schedule
      const scheduleData = {
        sectionId: section._id,
        subjectId: subject._id,
        day: slot.day,
        startTime: slot.startTime,
        endTime,
        semester,
        academicYear
      };
      
      const newSchedule = await Schedule.create(scheduleData);
      
      return {
        success: true,
        schedule: newSchedule,
        timeSlot: `${slot.day} ${slot.startTime}-${endTime}`
      };
    }
  }
  
  return { success: false, reason: "No available slot meeting all constraints" };
};

// Controller Functions
const generateSchedules = async (req, res) => {
  try {
    const { sectionId, semester, academicYear } = req.body;
    
    // Validation
    if (!sectionId || !semester) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    
    // Get section data
    const section = await Section.findById(sectionId)
      .populate("courseId yearId");
    if (!section) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    
    // Clear existing schedules
    await Schedule.deleteMany({ sectionId, semester, ...(academicYear && { academicYear }) });
    
    // Get subjects for this section
    const subjects = await Subject.find({
      courseId: section.courseId._id,
      yearLevelId: section.yearId._id,
      semester
    }).sort({ units: -1 });
    
    if (!subjects.length) {
      return res.status(404).json({ success: false, message: "No subjects found" });
    }
    
    // Scheduling process
    const results = {
      section: section.name,
      totalSubjects: subjects.length,
      scheduled: 0,
      failed: 0,
      details: []
    };
    
    const globalOccupied = await Schedule.find({
      semester,
      ...(academicYear && { academicYear })
    });
    
    for (const subject of subjects) {
      const result = await scheduleSubject(
        section,
        subject,
        semester,
        academicYear,
        globalOccupied
      );
      
      if (result.success) {
        results.scheduled++;
        globalOccupied.push({
          day: result.schedule.day,
          startTime: result.schedule.startTime,
          endTime: result.schedule.endTime,
          sectionId: section._id,
          subjectId: subject._id
        });
        
        results.details.push({
          subject: subject.subjectCode,
          status: "Scheduled",
          timeSlot: result.timeSlot
        });
      } else {
        results.failed++;
        results.details.push({
          subject: subject.subjectCode,
          status: "Failed",
          reason: result.reason
        });
      }
    }
    
    // Get final schedules
    const schedules = await Schedule.find({ sectionId, semester })
      .populate("subjectId", "subjectCode subjectName units");
    
    res.json({
      success: true,
      message: `Scheduled ${results.scheduled}/${results.totalSubjects} subjects`,
      results,
      schedules
    });
    
  } catch (error) {
    console.error("Scheduling error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const generateBulkSchedules = async (req, res) => {
  try {
    const { sectionIds, semester, academicYear } = req.body;
    
    // Validation
    if (!sectionIds?.length || !semester) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    
    // Get sections
    const sections = await Section.find({ _id: { $in: sectionIds } })
      .populate("courseId yearId");
    
    if (!sections.length) {
      return res.status(404).json({ success: false, message: "No sections found" });
    }
    
    // Clear existing schedules
    await Schedule.deleteMany({ 
      sectionId: { $in: sectionIds },
      semester,
      ...(academicYear && { academicYear }) 
    });
    
    // Initialize results
    const results = {
      totalSections: sections.length,
      processed: 0,
      totalSubjects: 0,
      scheduled: 0,
      sectionResults: []
    };
    
    // Get initial global occupied slots
    let globalOccupied = await Schedule.find({
      semester,
      ...(academicYear && { academicYear })
    });
    
    // Process each section
    for (const section of sections) {
      const sectionResult = {
        sectionId: section._id,
        sectionName: section.name,
        totalSubjects: 0,
        scheduled: 0,
        failed: 0,
        details: []
      };
      
      try {
        // Get subjects
        const subjects = await Subject.find({
          courseId: section.courseId._id,
          yearLevelId: section.yearId._id,
          semester
        }).sort({ units: -1 });
        
        if (!subjects.length) {
          sectionResult.message = "No subjects found";
          results.sectionResults.push(sectionResult);
          continue;
        }
        
        sectionResult.totalSubjects = subjects.length;
        results.totalSubjects += subjects.length;
        
        // Schedule each subject
        for (const subject of subjects) {
          const result = await scheduleSubject(
            section,
            subject,
            semester,
            academicYear,
            globalOccupied
          );
          
          if (result.success) {
            sectionResult.scheduled++;
            results.scheduled++;
            
            globalOccupied.push({
              day: result.schedule.day,
              startTime: result.schedule.startTime,
              endTime: result.schedule.endTime,
              sectionId: section._id,
              subjectId: subject._id
            });
            
            sectionResult.details.push({
              subject: subject.subjectCode,
              status: "Scheduled",
              timeSlot: result.timeSlot
            });
          } else {
            sectionResult.failed++;
            sectionResult.details.push({
              subject: subject.subjectCode,
              status: "Failed",
              reason: result.reason
            });
          }
        }
        
        results.processed++;
        sectionResult.message = `Scheduled ${sectionResult.scheduled}/${sectionResult.totalSubjects}`;
        results.sectionResults.push(sectionResult);
        
      } catch (error) {
        console.error(`Error processing section ${section.name}:`, error);
        results.sectionResults.push({
          ...sectionResult,
          message: `Error: ${error.message}`,
          details: [{ error: error.message }]
        });
      }
    }
    
    res.json({
      success: true,
      message: `Processed ${results.processed}/${results.totalSections} sections`,
      results
    });
    
  } catch (error) {
    console.error("Bulk scheduling error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get all schedules
const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find({})
    .populate("sectionId", "name")
    .populate("subjectId", "subjectCode subjectName units");
  
  res.json(schedules);
});

// Get schedules by section
const getSchedulesBySection = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  
  const schedules = await Schedule.find({ sectionId })
    .populate("sectionId", "name")
    .populate("subjectId", "subjectCode subjectName units")
    .sort({ day: 1, startTime: 1 });
  
  res.json(schedules);
});

// Get schedules by semester
const getSchedulesBySemester = asyncHandler(async (req, res) => {
  const { semester } = req.params;
  
  const schedules = await Schedule.find({ semester })
    .populate("sectionId", "name")
    .populate("subjectId", "subjectCode subjectName units")
    .sort({ sectionId: 1, day: 1, startTime: 1 });
  
  res.json(schedules);
});

// Delete all schedules
const deleteAllSchedules = asyncHandler(async (req, res) => {
  await Schedule.deleteMany({});
  res.json({ message: "All schedules deleted successfully" });
});

// Get scheduling analytics
const getSchedulingAnalytics = asyncHandler(async (req, res) => {
  const { semester, academicYear } = req.query;
  
  const query = {};
  if (semester) query.semester = semester;
  if (academicYear) query.academicYear = academicYear;
  
  const schedules = await Schedule.find(query)
    .populate("sectionId", "name")
    .populate("subjectId", "subjectCode");
  
  const analytics = {
    totalSchedules: schedules.length,
    sections: {},
    days: {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0
    }
  };
  
  schedules.forEach(schedule => {
    // Section analytics
    const sectionName = schedule.sectionId?.name || 'Unknown';
    if (!analytics.sections[sectionName]) {
      analytics.sections[sectionName] = 0;
    }
    analytics.sections[sectionName]++;
    
    // Day analytics
    analytics.days[schedule.day]++;
  });
  
  res.json(analytics);
});

// Visualization Endpoint
const getScheduleVisualization = async (req, res) => {
  try {
    const { semester, academicYear } = req.query;
    
    const query = { semester };
    if (academicYear) query.academicYear = academicYear;
    
    const schedules = await Schedule.find(query)
      .populate("sectionId", "name")
      .populate("subjectId", "subjectCode");
    
    // Format for calendar display
    const calendarData = schedules.map(schedule => ({
      id: schedule._id,
      title: `${schedule.subjectId.subjectCode} - ${schedule.sectionId.name}`,
      start: `${schedule.day}T${schedule.startTime}:00`,
      end: `${schedule.day}T${schedule.endTime}:00`,
      extendedProps: {
        section: schedule.sectionId.name
      }
    }));
    
    res.json(calendarData);
  } catch (error) {
    console.error("Visualization error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  generateSchedules,
  generateBulkSchedules,
  getSchedules,
  getSchedulesBySection,
  getSchedulesBySemester,
  deleteAllSchedules,
  getSchedulingAnalytics,
  getScheduleVisualization
};
