// newReports.js

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const prisma = new PrismaClient();
const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// POST endpoint to create a new report
router.post("/", async (req, res) => {
  const { type, month, year, dueDate, userId } = req.body;
  try {
    const newReport = await prisma.report.create({
      data: {
        type,
        month,
        year,
        dueDate: new Date(dueDate),
        userId,
      },
    });

    // Fetch all users with role "2"
    const role2Users = await prisma.user.findMany({
      where: { role: "2" },
    });

    // Convert the month number to month name
    const monthName = getMonthName(month);

    // Create notifications for users with role "2"
    const notifications = role2Users.map((role2User) => ({
      userId: role2User.user_id,
      title: "New Report Created",
      message: `You can now submit your ${type} for ${monthName} ${year}`,
      type: "info",
      read: false,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    res.status(201).json(newReport);
  } catch (error) {
    console.error("Failed to create report:", error);
    res.status(500).json({ error: "Failed to create report" });
  }
});

// GET endpoint to fetch report details
// GET endpoint to fetch report details including submission feedbacks
router.get("/report/:reportId", async (req, res) => {
  const { reportId } = req.params;
  const { userId } = req.query; // Assume userId is passed as query parameter

  try {
    const report = await prisma.report.findUnique({
      where: { reportId: parseInt(reportId) },
      include: {
        submissions: {
          include: {
            files: true,
            feedbacks: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const fileHistory = report.submissions
      .filter((submission) => submission.userId === parseInt(userId))
      .flatMap((submission) => submission.files);

    const feedbackHistory = report.submissions
      .filter((submission) => submission.userId === parseInt(userId))
      .flatMap((submission) => submission.feedbacks);

    const latestUserSubmission = report.submissions
      .filter((submission) => submission.userId === parseInt(userId))
      .sort((a, b) => b.submissionId - a.submissionId)[0];
    const userStatus = latestUserSubmission
      ? latestUserSubmission.status
      : "No Submission";

    res
      .status(200)
      .json({ ...report, fileHistory, feedbackHistory, userStatus });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report details" });
  }
});

// Helper function to convert month number to month name
const getMonthName = (monthNumber) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[parseInt(monthNumber) - 1];
};

// POST endpoint to submit a report with file attachments
router.post("/submit", upload.array("files", 3), async (req, res) => {
  const { userId, reportId } = req.body;
  const files = req.files;

  try {
    const newSubmission = await prisma.submission.create({
      data: {
        reportId: parseInt(reportId),
        userId: parseInt(userId),
        status: "Submitted",
      },
    });

    const fileAttachments = files.map((file) => ({
      reportId: parseInt(reportId),
      submissionId: newSubmission.submissionId,
      filePath: file.path,
      fileType: file.mimetype,
      fileName: file.originalname,
    }));

    await prisma.fileAttachment.createMany({
      data: fileAttachments,
    });

    const updatedFileHistory = await prisma.fileAttachment.findMany({
      where: { reportId: parseInt(reportId) },
      orderBy: { submissionId: "desc" },
    });

    const report = await prisma.report.findUnique({
      where: { reportId: parseInt(reportId) },
      include: { user: true },
    });

    const submittingUser = await prisma.user.findUnique({
      where: { user_id: parseInt(userId) },
    });

    if (!report || !submittingUser) {
      throw new Error("Report or submitting user not found");
    }

    const adminUsers = await prisma.user.findMany({
      where: { role: "1" },
    });

    const monthName = getMonthName(report.month);

    const notifications = adminUsers.map((adminUser) => ({
      userId: adminUser.user_id,
      title: "Report Submission",
      message: `${submittingUser.firstName} ${submittingUser.lastName} created a ${report.type} submission for the month of ${monthName} of ${report.year}`,
      type: "info",
      read: false,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    await prisma.report.update({
      where: { reportId: parseInt(reportId) },
      data: { isArchived: false },
    });

    res
      .status(200)
      .json({ submission: newSubmission, fileHistory: updatedFileHistory });
  } catch (error) {
    console.error("Failed to submit report:", error);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// POST endpoint to add feedback to a report
// POST endpoint to add feedback to a report
router.post("/:reportId/feedback", async (req, res) => {
  const { reportId } = req.params;
  const { userId, content, submissionId } = req.body;

  try {
    const newFeedback = await prisma.feedback.create({
      data: {
        reportId: parseInt(reportId),
        createdBy: parseInt(userId),
        content,
        submissionId: parseInt(submissionId), // Ensure submissionId is stored
      },
    });

    // Fetch submission and user details for notification
    const submission = await prisma.submission.findUnique({
      where: { submissionId: parseInt(submissionId) },
      include: { user: true },
    });

    if (!submission) {
      throw new Error("Submission not found");
    }

    // Determine the user to notify
    const userToNotifyId =
      submission.userId === parseInt(userId) ? 1 : submission.userId;
    const notificationMessage =
      submission.userId === parseInt(userId)
        ? `NPC provided feedback on your submission for report ${reportId}.`
        : `${submission.user.firstName} ${submission.user.lastName} provided feedback on your submission for report ${reportId}.`;

    await prisma.notification.create({
      data: {
        userId: userToNotifyId,
        title: "New Feedback Received",
        message: notificationMessage,
        type: "info",
        read: false,
      },
    });

    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ error: "Failed to add feedback" });
  }
});

// GET endpoint to fetch all non-archived reports
router.get("/", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { isArchived: false },
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// GET endpoint to check for duplicate reports
// GET endpoint to check for duplicate reports
router.get("/duplicates", async (req, res) => {
  const { type, month, year } = req.query;

  try {
    // Check for missing query parameters
    if (!type || !month || !year) {
      console.log(
        "Missing required query parameters:",
        JSON.stringify({ type, month, year }, null, 2)
      );
      return res
        .status(400)
        .json({ error: "Missing required query parameters" });
    }

    // Log received query parameters and their types in a structured format
    console.log(
      `Received query params - ${JSON.stringify(
        { type, month, year },
        null,
        2
      )}`
    );

    // Parse year to an integer
    const parsedYear = parseInt(year);
    if (isNaN(parsedYear)) {
      throw new Error("Invalid year parameter");
    }

    // Fetch reports from the database where type, month, and year match the query parameters
    const reports = await prisma.report.findMany({
      where: {
        type: type, // Ensure type is a string
        month: month, // Ensure month is a string
        year: parsedYear, // Ensure year is an integer
      },
    });

    // Check if duplicate reports were found and log the results
    if (reports.length > 0) {
      console.log("Duplicate reports found:", JSON.stringify(reports, null, 2));
    } else {
      console.log("No duplicate reports found.");
    }

    // Return the found reports as JSON
    res.status(200).json(reports);
  } catch (error) {
    // Log any errors with detailed information
    console.error("Error checking for duplicate reports:", {
      message: error.message,
      stack: error.stack,
      details: error,
    });
    res.status(500).json({
      error: "Failed to fetch reports",
      details: error.message,
    });
  }
});

// GET endpoint to fetch all submission IDs and user details for a specific report
router.get("/:reportId/submissions", async (req, res) => {
  const { reportId } = req.params;

  try {
    const submissions = await prisma.submission.findMany({
      where: { reportId: parseInt(reportId) },
      select: {
        submissionId: true,
        user: {
          select: {
            user_id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const uniqueUsers = {};
    submissions.forEach((submission) => {
      uniqueUsers[submission.user.user_id] = submission.user;
    });

    res.status(200).json(Object.values(uniqueUsers));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// PATCH endpoint to update the report status
router.patch("/:reportId/status", async (req, res) => {
  const { reportId } = req.params;
  const { userId, status } = req.body;

  try {
    const updatedSubmissions = await prisma.submission.updateMany({
      where: {
        reportId: parseInt(reportId),
        userId: parseInt(userId),
      },
      data: {
        status: status,
      },
    });

    const report = await prisma.report.findUnique({
      where: { reportId: parseInt(reportId) },
      include: { user: true },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    const monthName = getMonthName(report.month);

    await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        title: "Report Status Update",
        message: `NPC updated the status of your ${report.type} for ${monthName} ${report.year} to ${status}`,
        type: "info",
        read: false,
      },
    });

    res
      .status(200)
      .json({ message: "Status updated successfully", updatedSubmissions });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.patch("/archive/:reportId", async (req, res) => {
  const { reportId } = req.params;

  try {
    const archivedReport = await prisma.report.update({
      where: { reportId: parseInt(reportId) },
      data: { isArchived: true },
    });
    res.status(200).json(archivedReport);
  } catch (error) {
    res.status(500).json({ error: "Failed to archive report" });
  }
});

// PATCH endpoint to update a report
router.patch("/:reportId", async (req, res) => {
  const { reportId } = req.params;
  const { type, month, year, dueDate, otherType } = req.body;

  try {
    const updateData = {
      type: type === "Other" ? otherType : type,
      month,
      year,
      dueDate: new Date(dueDate),
    };

    const updatedReport = await prisma.report.update({
      where: { reportId: parseInt(reportId) },
      data: updateData,
    });

    res.status(200).json(updatedReport);
  } catch (error) {
    console.error("Failed to update report:", error);
    res.status(500).json({ error: "Failed to update report" });
  }
});

// Function to notify users one day before the due date
const notifyUsersBeforeDueDate = async () => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        dueDate: {
          lte: dayjs().add(1, "day").toDate(),
          gte: dayjs().toDate(),
        },
      },
      include: {
        submissions: true,
        user: true,
      },
    });

    for (const report of reports) {
      const monthName = getMonthName(report.month);
      const usersWithoutSubmission = await prisma.user.findMany({
        where: {
          role: "2",
          NOT: {
            submissions: {
              some: {
                reportId: report.reportId,
              },
            },
          },
        },
      });

      const notifications = usersWithoutSubmission.map((user) => ({
        userId: user.user_id,
        title: "Submission Reminder",
        message: `There is only 1 day left for you to submit your report on ${report.type} for ${monthName} ${report.year}`,
        type: "warning",
        read: false,
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    }
  } catch (error) {
    console.error("Failed to notify users before due date:", error);
  }
};

// Function to notify users after the due date has passed
const notifyUsersAfterDueDate = async () => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        dueDate: {
          lt: dayjs().toDate(),
        },
        submissions: {
          none: {},
        },
      },
      include: {
        user: true,
      },
    });

    for (const report of reports) {
      const monthName = getMonthName(report.month);
      const usersWithoutSubmission = await prisma.user.findMany({
        where: {
          role: "2",
          NOT: {
            submissions: {
              some: {
                reportId: report.reportId,
              },
            },
          },
        },
      });

      const notifications = usersWithoutSubmission.map((user) => ({
        userId: user.user_id,
        title: "Missed Submission",
        message: `The submission due date for ${report.type} for ${monthName} ${report.year} has passed, and you did not submit your report.`,
        type: "error",
        read: false,
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    }
  } catch (error) {
    console.error("Failed to notify users after due date:", error);
  }
};

module.exports = router;
