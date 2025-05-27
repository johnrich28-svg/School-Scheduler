module.exports = (app) => {
  /**
   * =============================
   * 1. User Authentication Routes
   * =============================
   * Handles login, registration, etc. for general users
   */
  app.use("/api/auth", require("./user/auth"));

  /**
   * =============================
   * 2. Admin & Superadmin Access
   * =============================
   * Handles role-based authentication and access control
   */
  app.use("/api/auth/admin", require("./access/admin")); // Admin-only authentication routes
  app.use("/api/auth/superadmin", require("./access/superadmin")); // Superadmin-only authentication routes

  /**
   * =============================
   * 3. Admin Management Routes
   * =============================
   * Only accessible by admins for managing academic data
   */
  app.use("/api/admin/years", require("./access/admin")); // Manage year levels
  app.use("/api/admin/sections", require("./access/admin")); // Manage course sections
  app.use("/api/admin/subjects", require("./access/admin")); // Manage subjects
  app.use("/api/admin/rooms", require("./access/admin")); // Manage rooms
  app.use("/api/admin/schedule", require("./access/admin"));

  /**
   * =============================
   * 3. Public Management Routes
   * =============================
   * accesible for anyone
   */
  app.use("/api/public/courses", require("./access/public"));
  app.use("/api/public/sections", require("./access/public"));
  app.use("/api/public/year-level", require("./access/public"));
  app.use("/api/public/subjects", require("./access/public"));
  app.use("/api/public/timeslots", require("./access/public"));
};
