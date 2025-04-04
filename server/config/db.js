const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/Users");

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

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    await createSuperAdmin();
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
};

module.exports = connectDB;
