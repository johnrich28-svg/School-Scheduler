module.exports = (app) => {
  app.use("/api/auth", require("./user/auth"));
  app.use("/api/auth/admin", require("./access/admin"));
  app.use("/api/auth/superadmin", require("./access/superadmin"));
  app.use("/api/years", require("./yearRoutes"));
  // app.use("/api/sections", sectionRoutes);
};
