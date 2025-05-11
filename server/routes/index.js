module.exports = (app) => {
  app.use("/api/auth", require("./user/auth"));
  app.use("/api/auth/admin", require("./access/admin"));
  app.use("/api/auth/superadmin", require("./access/superadmin"));
  app.use("/api/admin/years", require("./access/admin"));
  app.use("/api/admin/sections", require("./access/admin"));
  app.use("/api/admin/subjects", require("./access/admin"));
  app.use("/api/admin/rooms", require("./access/admin"));
};
