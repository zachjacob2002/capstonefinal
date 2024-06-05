// app.js (backend)

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const bnsRouter = require("./routes/bns");
const bnsSubmissionListRouter = require("./routes/bnsSubmissionList");
const reportsRouter = require("./routes/reports");
const beneficiariesRouter = require("./routes/beneficiaries");
const activitiesRouter = require("./routes/activities");
const notificationsRouter = require("./routes/notifications");
const dashboardRouter = require("./routes/dashboard");
const calendarRouter = require("./routes/calendar");
const participationRouter = require("./routes/participation");
const typeRouter = require("./routes/types");
const typeModalRouter = require("./routes/typeModal");
const newReportsRouter = require("./routes/newReports");
const archivesRouter = require("./routes/archives");

var app = express();

var cors = require("cors");
app.use(
  cors({
    origin: ["http://localhost:5173"], // Allowed origins for CORS
    methods: ["GET", "DELETE", "PATCH", "POST", "PUT"],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/bns", bnsRouter);
app.use("/bns-submissions", bnsSubmissionListRouter);
app.use("/reports", reportsRouter);
app.use("/beneficiaries", beneficiariesRouter);
app.use("/activities", activitiesRouter);
app.use("/notifications", notificationsRouter);
app.use("/dashboard", dashboardRouter);
app.use("/calendar", calendarRouter);
app.use("/participation", participationRouter);
app.use("/types", typeRouter);
app.use("/typeModal", typeModalRouter);
app.use("/newReports", newReportsRouter);
app.use("/archives", archivesRouter);

app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  console.error("Error stack:", err.stack); // Log the full error stack
  console.error("Error details:", {
    message: err.message,
    status: err.status,
    stack: err.stack,
  }); // Log detailed error information

  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
