const Schedule = require("../models/Schedule");
const Subject = require("../models/Subjects");
const User = require("../models/Users");
const Section = require("../models/Sections");
const Room = require("../models/Room");
const TimeSlot = require("../models/TimeSlot");

const autoGenerateSchedules = async (req, res) => {
  try {
    const professors = await User.find({ role: "professor", isApproved: true });
    if (professors.length === 0)
      return res.status(400).json({ message: "No approved professors found." });

    const subjects = await Subject.find();
    if (subjects.length === 0)
      return res.status(400).json({ message: "No subjects found." });

    const sections = await Section.find();
    if (sections.length === 0)
      return res.status(400).json({ message: "No sections found." });

    const rooms = await Room.find();
    if (rooms.length === 0)
      return res.status(400).json({ message: "No rooms found." });

    const timeSlots = await TimeSlot.find().sort({ sequence: 1 });
    if (timeSlots.length === 0)
      return res.status(400).json({ message: "No timeslots found." });

    // Booking tracker to avoid conflicts for professor, room, and section
    const bookingTracker = {};

    const isAvailable = (day, timeSlotId, professorId, roomId, sectionId) => {
      const key = `${day}-${timeSlotId}`;
      if (!bookingTracker[key]) {
        bookingTracker[key] = {
          professors: new Set(),
          rooms: new Set(),
          sections: new Set(),
        };
      }
      return (
        !bookingTracker[key].professors.has(professorId.toString()) &&
        !bookingTracker[key].rooms.has(roomId.toString()) &&
        !bookingTracker[key].sections.has(sectionId.toString())
      );
    };

    const bookSlot = (day, timeSlotId, professorId, roomId, sectionId) => {
      const key = `${day}-${timeSlotId}`;
      if (!bookingTracker[key]) {
        bookingTracker[key] = {
          professors: new Set(),
          rooms: new Set(),
          sections: new Set(),
        };
      }
      bookingTracker[key].professors.add(professorId.toString());
      bookingTracker[key].rooms.add(roomId.toString());
      bookingTracker[key].sections.add(sectionId.toString());
    };

    const schedulesToCreate = [];

    for (const section of sections) {
      // Get semester and academicYear from section or default values
      const semester = section.semester || "1st"; // adjust if your model is different
      const academicYear = section.academicYear || "2024-2025";

      const sectionSubjects = subjects.filter(
        (subj) =>
          subj.courseId.toString() === section.courseId.toString() &&
          subj.yearLevelId.toString() === section.yearId.toString()
      );

      for (const subject of sectionSubjects) {
        let scheduled = false;

        const availableProfessors = professors.filter((prof) => {
          return prof.preferredSubjects.some(
            (psubjId) => psubjId.toString() === subject._id.toString()
          );
        });

        for (const prof of availableProfessors) {
          if (scheduled) break;

          for (const timeSlot of timeSlots) {
            if (scheduled) break;

            // Check professor availability for this day/time
            const isProfAvailable = prof.profAvail.some((avail) => {
              return (
                avail.day === timeSlot.day &&
                avail.startTime <= timeSlot.startTime &&
                avail.endTime >= timeSlot.endTime
              );
            });
            if (!isProfAvailable) continue;

            for (const room of rooms) {
              if (
                isAvailable(
                  timeSlot.day,
                  timeSlot._id,
                  prof._id,
                  room._id,
                  section._id
                )
              ) {
                bookSlot(
                  timeSlot.day,
                  timeSlot._id,
                  prof._id,
                  room._id,
                  section._id
                );

                schedulesToCreate.push({
                  subjectId: subject._id,
                  professorId: prof._id,
                  sectionId: section._id,
                  roomId: room._id,
                  timeSlotId: timeSlot._id,
                  day: timeSlot.day,
                  semester,
                  academicYear,
                });

                scheduled = true;
                break;
              }
            }
          }
        }

        if (!scheduled) {
          console.warn(
            `Could not schedule subject ${subject._id} for section ${section._id}`
          );
        }
      }
    }

    if (schedulesToCreate.length === 0) {
      return res
        .status(400)
        .json({ message: "No schedules could be generated due to conflicts." });
    }

    const createdSchedules = await Schedule.insertMany(schedulesToCreate);

    res.status(201).json({
      message: `Successfully generated ${createdSchedules.length} schedules.`,
      schedules: createdSchedules,
    });
  } catch (error) {
    console.error("Schedule generation error:", error);
    res.status(500).json({ message: "Server error generating schedules." });
  }
};

module.exports = { autoGenerateSchedules };
