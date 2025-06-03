const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/Users");
const Schedule = require("../models/Schedule");

dotenv.config();

// Create Super Admin if not exists
const createSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({ role: "superadmin" });
    if (existingSuperAdmin) return;

    const superAdmin = new User({
      username: "superadmin",
      email: "superadmin@example.com",
      password: "superadmin123", // Let pre-save middleware hash it
      role: "superadmin",
      isApproved: true,
    });

    await superAdmin.save();
    console.log("✅ Super Admin created!");
    console.log("➡ Email: superadmin@example.com");
    console.log("➡ Password: superadmin123");
  } catch (error) {
    console.error("❌ Error creating Super Admin:", error);
  }
};

// Drop and recreate indexes
const recreateIndexes = async () => {
  try {
    // Drop all indexes from the schedules collection
    await Schedule.collection.dropIndexes();
    console.log("✅ Dropped all indexes from schedules collection");

    // Recreate the indexes
    await Schedule.collection.createIndex({ sectionId: 1, semester: 1, academicYear: 1 });
    await Schedule.collection.createIndex({ subjectId: 1, semester: 1 });
    await Schedule.collection.createIndex(
      { sectionId: 1, day: 1, startTime: 1, endTime: 1, semester: 1 },
      { unique: true }
    );
    console.log("✅ Recreated indexes for schedules collection");
  } catch (error) {
    console.error("❌ Error recreating indexes:", error);
  }
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    await createSuperAdmin();
    await recreateIndexes();
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
};

module.exports = connectDB;
