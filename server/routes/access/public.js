const express = require("express");
const router = express.Router();
const {
  getCourses,
  getAllSections,
  getYearLevels,
  getSubjects,
} = require("../../controllers/public/publicController");

// Route: GET /api/public/courses
router.get("/get-courses", getCourses);

// Route: GET /api/public/sections
router.get("/get-sections", getAllSections);

// Route: Get /api/public/year-level
router.get("/get-year", getYearLevels);

// Route: Get /api/public/get-subjects
router.get("/get-subjects", getSubjects);

module.exports = router;
