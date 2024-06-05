// reports.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router(); // Initialize the router

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); // Save files in the 'uploads' directory within the backend directory
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// Submit a new report
// Submit a new report
router.post("/", async (req, res) => {
  const { userId, type, month, year } = req.body;
  try {
    const newReport = await prisma.report.create({
      data: {
        userId,
        type,
        month,
        year,
        status: "Submitted", // Default status
      },
    });

    // Fetch all users with role "1"
    const usersWithRole1 = await prisma.user.findMany({
      where: {
        role: "1",
      },
    });

    // Fetch user details for notification
    const user = await prisma.user.findUnique({
      where: {
        user_id: userId,
      },
    });

    // Create notifications for each user with role "1"
    await prisma.notification.createMany({
      data: usersWithRole1.map((adminUser) => ({
        userId: adminUser.user_id,
        title: "Report Submission",
        message: `${user.firstName} ${user.lastName} submitted their ${type} for ${month} ${year}`,
        type: "report",
      })),
    });

    res.status(201).json(newReport);
  } catch (error) {
    res.status(400).json({ message: "Error creating report", error });
  }
});

// POST endpoint for uploading a file to a report
router.post("/:reportId/files", upload.single("filePath"), async (req, res) => {
  const { reportId } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Only store the filename in the database
  const filePath = req.file.filename; // Changed from req.file.path to req.file.filename

  try {
    const file = await prisma.fileAttachment.create({
      data: {
        reportId: parseInt(reportId, 10),
        filePath: filePath, // Use the filename only
        fileType: req.file.mimetype,
      },
    });
    res.status(201).json(file);
  } catch (error) {
    console.error("Failed to attach file to report:", error);
    res.status(400).json({ message: "Error attaching file to report", error });
  }
});

// POST endpoint for submitting feedback on a report
router.post("/:reportId/feedbacks", async (req, res) => {
  const { reportId } = req.params;
  const { content, createdBy } = req.body;
  try {
    const feedback = await prisma.feedback.create({
      data: {
        reportId: parseInt(reportId, 10),
        content,
        createdBy,
      },
    });

    // Fetch report details for notification
    const report = await prisma.report.findUnique({
      where: {
        reportId: parseInt(reportId, 10),
      },
      include: {
        user: true,
      },
    });

    // Create a notification for the report owner if the feedback was created successfully
    if (report) {
      await prisma.notification.create({
        data: {
          userId: report.userId, // Owner of the report
          title: "New Feedback",
          message: `You have received new feedback on ${report.type} for ${report.month} ${report.year}.`,
          type: "Feedback",
        },
      });
    }

    res.status(201).json(feedback);
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    res.status(400).json({ message: "Error submitting feedback", error });
  }
});

router.get("/", async (req, res) => {
  const { type, month, year, userId } = req.query;
  try {
    const whereClause = {
      ...(type && { type }),
      ...(month && { month }),
      ...(year && { year: parseInt(year, 10) }),
      ...(userId && { userId: parseInt(userId, 10) }), // Ensure userId is considered
    };

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        user: true,
        files: true,
        feedbacks: true,
      },
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reports", error });
  }
});

// Fetch all reports for a specific month and year, including user details
router.get("/submissions", async (req, res) => {
  const { month, year, type } = req.query;
  console.log("Month:", month, "Year:", parseInt(year, 10), "Type:", type); // Ensure conversion is working

  try {
    const reports = await prisma.report.findMany({
      where: {
        month,
        year: parseInt(year, 10), // Convert year to an integer
        type, // Filter by report type
      },
      include: {
        user: true,
        files: true,
        feedbacks: true,
      },
    });
    res.json(reports);
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    res.status(500).json({ message: "Failed to fetch reports", error });
  }
});

// GET endpoint for fetching report details
router.get("/details", async (req, res) => {
  const { month, year, userId } = req.query;

  if (!month || !year || !userId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const report = await prisma.report.findFirst({
      where: {
        month,
        year: parseInt(year, 10),
        userId: parseInt(userId, 10),
      },
      include: {
        user: true,
        files: true,
        feedbacks: true,
      },
    });

    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ message: "No report found" });
    }
  } catch (error) {
    console.error("Failed to fetch report details:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// PATCH endpoint for updating a file attached to a report
router.patch("/files/:fileId", upload.single("filePath"), async (req, res) => {
  const { fileId } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Fetch the existing file details to get the associated report and user
    const existingFile = await prisma.fileAttachment.findUnique({
      where: { fileId: parseInt(fileId, 10) },
      include: { report: true },
    });

    if (!existingFile) {
      return res.status(404).json({ message: "File not found" });
    }

    // Update the file in the database using fileId
    const updatedFile = await prisma.fileAttachment.update({
      where: { fileId: parseInt(fileId, 10) },
      data: {
        filePath: req.file.filename, // Ensure the correct filename is stored
        fileType: req.file.mimetype,
      },
    });

    // Fetch the report details
    const report = await prisma.report.findUnique({
      where: { reportId: existingFile.reportId },
      include: { user: true },
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Fetch all users with role "1" for notification
    const usersWithRole1 = await prisma.user.findMany({
      where: {
        role: "1",
      },
    });

    // Create notifications for each user with role "1"
    const notifications = usersWithRole1.map(async (adminUser) => {
      return prisma.notification.create({
        data: {
          userId: adminUser.user_id,
          title: "New File Submission",
          message: `${report.user.firstName} ${report.user.lastName} has a new submission for the ${report.type} for ${report.month} ${report.year}.`,
          type: "File Update",
        },
      });
    });

    await Promise.all(notifications);

    res.status(200).json(updatedFile);
  } catch (error) {
    console.error("Failed to update file:", error);
    res.status(500).json({ message: "Error updating file", error });
  }
});
// DELETE endpoint to remove a report and its related data
router.delete("/:reportId", async (req, res) => {
  const { reportId } = req.params;
  try {
    // Optionally delete files and feedbacks manually if not cascading
    await prisma.fileAttachment.deleteMany({
      where: { reportId: parseInt(reportId, 10) },
    });
    await prisma.feedback.deleteMany({
      where: { reportId: parseInt(reportId, 10) },
    });

    // Now delete the report
    await prisma.report.delete({
      where: { reportId: parseInt(reportId, 10) },
    });
    res
      .status(200)
      .json({ message: "Report and related data deleted successfully" });
  } catch (error) {
    console.error("Failed to delete report:", error);
    res.status(500).json({ message: "Error deleting report", error });
  }
});

// Fetch the count of reports for a specific month and year
router.get("/submissions-count", async (req, res) => {
  const { month, year, type } = req.query;

  if (!month || !year || !type) {
    return res
      .status(400)
      .json({ message: "Month, year, and type are required" });
  }

  try {
    const count = await prisma.report.count({
      where: {
        month,
        year: parseInt(year, 10),
        type, // Filter by report type
      },
    });

    res.json({ count });
  } catch (error) {
    console.error("Failed to fetch submission count:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch submission count", error });
  }
});

// GET endpoint for fetching a specific report by reportId
router.get("/report/:reportId", async (req, res) => {
  const { reportId } = req.params;
  const numericReportId = parseInt(reportId, 10); // Always specify the radix

  if (isNaN(numericReportId)) {
    return res.status(400).json({ message: "Invalid report ID provided" });
  }

  try {
    const report = await prisma.report.findUnique({
      where: {
        reportId: numericReportId, // Correct field name according to your Prisma schema
      },
      include: {
        user: true,
        files: true,
        feedbacks: {
          include: {
            user: true, // include this to fetch user details for each feedback
          },
        },
      },
    });

    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    console.error("Failed to fetch report:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// PATCH endpoint to update the status of a report and send a notification
router.patch("/:reportId/status", async (req, res) => {
  const { reportId } = req.params;
  const { status, userId } = req.body; // Include userId of the admin making the change

  try {
    const updatedReport = await prisma.report.update({
      where: { reportId: parseInt(reportId, 10) },
      data: { status },
      include: { user: true }, // Include user to get details for notification
    });

    let notification = null; // Define notification here to ensure scope visibility

    // Create a notification for the report owner if the update was successful
    if (updatedReport) {
      notification = await prisma.notification.create({
        data: {
          userId: updatedReport.userId, // Owner of the report
          title: "Status Report",
          message: `The status of your Monthly Accomplishment Report for the month of ${updatedReport.month} ${updatedReport.year} is now changed to ${status}.`,
          type: "Status Update",
        },
      });
    }

    res.json({ updatedReport, notification }); // Safely return the notification object
  } catch (error) {
    console.error("Failed to update report status:", error);
    res.status(500).json({ message: "Error updating report status", error });
  }
});

// Fetch details of narrative reports
router.get("/narrative-details", async (req, res) => {
  const { month, year, userId } = req.query;

  if (!month || !year || !userId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const report = await prisma.report.findFirst({
      where: {
        type: "Narrative Report",
        month,
        year: parseInt(year, 10),
        userId: parseInt(userId, 10),
      },
      include: {
        user: true,
        files: true,
        feedbacks: true,
      },
    });

    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ message: "No narrative report found" });
    }
  } catch (error) {
    console.error("Failed to fetch narrative report details:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Fetch the count of narrative reports for a specific month and year
router.get("/narrative-submissions-count", async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: "Month and year are required" });
  }

  try {
    const count = await prisma.report.count({
      where: {
        type: "Narrative Report",
        month,
        year: parseInt(year, 10),
      },
    });

    res.json({ count });
  } catch (error) {
    console.error("Failed to fetch narrative submission count:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch narrative submission count", error });
  }
});

// Fetch details of work activity reports
router.get("/work-activity-details", async (req, res) => {
  const { month, year, userId } = req.query;

  if (!month || !year || !userId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const report = await prisma.report.findFirst({
      where: {
        type: "Work Activity Schedule Report",
        month,
        year: parseInt(year, 10),
        userId: parseInt(userId, 10),
      },
      include: {
        user: true,
        files: true,
        feedbacks: true,
      },
    });

    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ message: "No work activity report found" });
    }
  } catch (error) {
    console.error("Failed to fetch work activity report details:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Fetch the count of work activity reports for a specific month and year
router.get("/work-activity-submissions-count", async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: "Month and year are required" });
  }

  try {
    const count = await prisma.report.count({
      where: {
        type: "Work Activity Schedule Report",
        month,
        year: parseInt(year, 10),
      },
    });

    res.json({ count });
  } catch (error) {
    console.error("Failed to fetch work activity submission count:", error);
    res.status(500).json({
      message: "Failed to fetch work activity submission count",
      error,
    });
  }
});

// Fetch details of work activity schedule reports
router.get("/work-activity-schedule-details", async (req, res) => {
  const { month, year, userId } = req.query;

  if (!month || !year || !userId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const report = await prisma.report.findFirst({
      where: {
        type: "Work Activity Schedule Report",
        month,
        year: parseInt(year, 10),
        userId: parseInt(userId, 10),
      },
      include: {
        user: true,
        files: true,
        feedbacks: true,
      },
    });

    if (report) {
      res.json(report);
    } else {
      res
        .status(404)
        .json({ message: "No work activity schedule report found" });
    }
  } catch (error) {
    console.error(
      "Failed to fetch work activity schedule report details:",
      error
    );
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Fetch the count of work activity schedule reports for a specific month and year
router.get("/work-activity-schedule-submissions-count", async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: "Month and year are required" });
  }

  try {
    const count = await prisma.report.count({
      where: {
        type: "Work Activity Schedule Report",
        month,
        year: parseInt(year, 10),
      },
    });

    res.json({ count });
  } catch (error) {
    console.error(
      "Failed to fetch work activity schedule submission count:",
      error
    );
    res.status(500).json({
      message: "Failed to fetch work activity schedule submission count",
      error,
    });
  }
});

router.get("/monthly-accomplishment-details", async (req, res) => {
  const { month, year, userId } = req.query;

  if (!month || !year || !userId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const report = await prisma.report.findFirst({
      where: {
        type: "Monthly Accomplishment Report",
        month,
        year: parseInt(year, 10),
        userId: parseInt(userId, 10),
      },
      include: {
        user: true,
        files: true,
        feedbacks: true,
      },
    });

    if (report) {
      res.json(report);
    } else {
      res
        .status(404)
        .json({ message: "No monthly accomplishment report found" });
    }
  } catch (error) {
    console.error(
      "Failed to fetch monthly accomplishment report details:",
      error
    );
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
