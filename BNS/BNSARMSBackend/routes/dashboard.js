const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Endpoint to get the total BNS count
router.get("/total-bns", async (req, res) => {
  try {
    const count = await prisma.user.count({
      where: {
        role: "2",
        isArchived: false,
      },
    });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching BNS count:", error);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get the report count and status distribution
router.get("/report-count", async (req, res) => {
  const { type, year, month } = req.query;

  try {
    const submissions = await prisma.submission.findMany({
      where: {
        report: {
          type,
          year: parseInt(year),
          month,
        },
      },
      distinct: ["userId"], // Ensure only one submission per user is counted
      include: {
        report: true,
      },
    });

    const totalCount = submissions.length;

    const statusCounts = await prisma.submission.groupBy({
      by: ["status", "userId"],
      where: {
        report: {
          type,
          year: parseInt(year),
          month,
        },
      },
      _count: {
        status: true,
      },
    });

    const statusDistribution = {
      Submitted: 0,
      "Needs Revision": 0,
      Completed: 0,
    };

    const uniqueStatuses = {};

    statusCounts.forEach((statusCount) => {
      const { status, userId } = statusCount;
      if (!uniqueStatuses[userId]) {
        uniqueStatuses[userId] = {};
      }
      uniqueStatuses[userId][status] = true;
    });

    Object.values(uniqueStatuses).forEach((statuses) => {
      Object.keys(statuses).forEach((status) => {
        statusDistribution[status]++;
      });
    });

    res.json({ totalCount, statusDistribution });
  } catch (error) {
    console.error("Error fetching report count:", error);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get the recent submissions
router.get("/recent-submissions", async (req, res) => {
  try {
    const recentSubmissions = await prisma.submission.findMany({
      distinct: ["userId"],
      orderBy: {
        submissionId: "desc",
      },
      include: {
        user: true,
        report: true,
      },
    });

    const formattedSubmissions = recentSubmissions.map((submission) => ({
      id: submission.submissionId,
      name: `${submission.user.firstName} ${submission.user.lastName}`,
      type: submission.report.type,
      monthYear: `${submission.report.month}-${submission.report.year}`,
      submissionDate: submission.submissionDate,
      status: submission.status,
    }));

    res.json(formattedSubmissions);
  } catch (error) {
    console.error("Error fetching recent submissions:", error);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get the total activities count for the current year
router.get("/total-activities", async (req, res) => {
  try {
    const totalActivities = await prisma.activity.count({
      where: {
        isArchived: false,
      },
    });
    res.json({ totalActivities });
  } catch (error) {
    console.error("Error fetching total activities count:", error);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get the total number of beneficiaries
router.get("/total-beneficiaries", async (req, res) => {
  try {
    const totalBeneficiaries = await prisma.beneficiary.count({
      where: {
        isArchived: false,
      },
    });
    res.json({ totalBeneficiaries });
  } catch (error) {
    console.error("Error fetching total beneficiaries count:", error);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get activities count by month in a year
router.get("/activities-count-by-month", async (req, res) => {
  const { year } = req.query;

  try {
    const activitiesCount = await prisma.$queryRaw`
      SELECT EXTRACT(MONTH FROM "activity_date") as month, COUNT(*) as count
      FROM "activities"
      WHERE EXTRACT(YEAR FROM "activity_date") = ${parseInt(year)}
        AND "isArchived" = false
      GROUP BY month
      ORDER BY month;
    `;

    // Convert BigInt to number
    const activitiesCountFormatted = activitiesCount.map((activity) => ({
      month: Number(activity.month),
      count: Number(activity.count),
    }));

    res.json(activitiesCountFormatted);
  } catch (error) {
    console.error("Error fetching activities count by month:", error);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get user report status
router.get("/user-report-status", async (req, res) => {
  const { userId, type, year, month } = req.query;

  try {
    const latestSubmission = await prisma.submission.findFirst({
      where: {
        userId: parseInt(userId),
        report: {
          type: type,
          year: parseInt(year),
          month: month,
        },
      },
      orderBy: {
        submissionId: "desc",
      },
      select: {
        status: true,
      },
    });

    const status = latestSubmission ? latestSubmission.status : "No submission";
    res.json({ status });
  } catch (error) {
    console.error("Error fetching user report status:", error);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get recent reports
router.get("/user-recent-reports", async (req, res) => {
  const { userId } = req.query;

  try {
    const recentReports = await prisma.submission.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        submissionDate: "desc",
      },
      include: {
        report: true,
      },
    });

    const formattedReports = recentReports.map((submission) => ({
      id: submission.submissionId,
      name: `${submission.report.type}`,
      type: submission.report.type,
      monthYear: `${submission.report.month}-${submission.report.year}`,
      submissionDate: submission.submissionDate,
      status: submission.status,
    }));

    res.json(formattedReports);
  } catch (error) {
    console.error("Error fetching user recent reports:", error);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get the report ID based on userId, type, year, and month
router.get("/get-report-id", async (req, res) => {
  const { userId, type, year, month } = req.query;

  try {
    const report = await prisma.submission.findFirst({
      where: {
        userId: parseInt(userId),
        report: {
          type: type,
          year: parseInt(year),
          month: month,
        },
      },
      select: {
        submissionId: true,
      },
    });

    if (report) {
      res.json({ reportId: report.submissionId });
    } else {
      res.status(404).json({ error: "Report not found" });
    }
  } catch (error) {
    console.error("Error fetching report ID:", error);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get the total activities count (unarchived) of the current user this current year
router.get("/total-activities-user", async (req, res) => {
  const { userId } = req.query;

  try {
    const currentYear = new Date().getFullYear();
    const totalActivities = await prisma.activity.count({
      where: {
        createdBy: parseInt(userId),
        isArchived: false,
        activityDate: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    });
    res.json({ totalActivities });
  } catch (error) {
    console.error("Error fetching total activities count for user:", error);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get activities count by month in a year for the current user
router.get("/activities-count-by-month-user", async (req, res) => {
  const { userId, year } = req.query;

  try {
    const activitiesCount = await prisma.$queryRaw`
      SELECT EXTRACT(MONTH FROM "activity_date") as month, COUNT(*) as count
      FROM "activities"
      WHERE EXTRACT(YEAR FROM "activity_date") = ${parseInt(year)}
        AND "created_by" = ${parseInt(userId)}
        AND "isArchived" = false
      GROUP BY month
      ORDER BY month;
    `;

    // Convert BigInt to number
    const activitiesCountFormatted = activitiesCount.map((activity) => ({
      month: Number(activity.month),
      count: Number(activity.count),
    }));

    res.json(activitiesCountFormatted);
  } catch (error) {
    console.error("Error fetching activities count by month for user:", error);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get the count of recent "Completed" reports for each BNS
router.get("/recent-completed-reports", async (req, res) => {
  const { type, year, month } = req.query;

  try {
    const submissions = await prisma.submission.findMany({
      where: {
        report: {
          type,
          year: parseInt(year),
          month,
        },
      },
      orderBy: {
        submissionId: "desc",
      },
      distinct: ["userId"], // Ensure only one submission per user is counted
      include: {
        report: true,
      },
    });

    const completedCount = submissions.filter(
      (submission) => submission.status === "Completed"
    ).length;

    res.json({ completedCount });
  } catch (error) {
    console.error("Error fetching recent completed reports:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
