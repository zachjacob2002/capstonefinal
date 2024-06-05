const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router(); // Initialize the router

// Endpoint to get archived beneficiaries
router.get("/beneficiaries", async (req, res) => {
  const { isArchived, role, barangay } = req.query;
  const filter = { isArchived: isArchived === "true" };
  if (role !== "1") {
    filter.barangay = barangay;
  }
  const beneficiaries = await prisma.beneficiary.findMany({
    where: filter,
  });
  res.json(beneficiaries);
});

// Endpoint to restore archived beneficiary
router.patch("/beneficiaries/restore/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const restoredBeneficiary = await prisma.beneficiary.update({
      where: { beneficiaryId: parseInt(id) },
      data: { isArchived: false },
    });
    res.json(restoredBeneficiary);
  } catch (error) {
    res.status(500).json({ error: "Failed to restore beneficiary" });
  }
});

// Endpoint to get archived activities
router.get("/activities", async (req, res) => {
  const { isArchived, role, userId } = req.query;
  const filter = { isArchived: isArchived === "true" };
  if (role !== "1") {
    filter.createdBy = parseInt(userId); // Filter by the logged-in user's ID
  }
  const activities = await prisma.activity.findMany({
    where: filter,
  });
  res.json(activities);
});

// Endpoint to restore archived activity
router.patch("/activities/restore/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const restoredActivity = await prisma.activity.update({
      where: { activityId: parseInt(id) },
      data: { isArchived: false },
    });
    res.json(restoredActivity);
  } catch (error) {
    res.status(500).json({ error: "Failed to restore activity" });
  }
});

// Endpoint to get archived reports
router.get("/reports", async (req, res) => {
  const { isArchived } = req.query;
  const reports = await prisma.report.findMany({
    where: { isArchived: isArchived === "true" },
  });
  res.json(reports);
});

// Endpoint to restore archived report
router.patch("/reports/restore/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const restoredReport = await prisma.report.update({
      where: { reportId: parseInt(id) },
      data: { isArchived: false },
    });
    res.json(restoredReport);
  } catch (error) {
    res.status(500).json({ error: "Failed to restore report" });
  }
});

// Endpoint to get archived BNS users
router.get("/bns", async (req, res) => {
  const { isArchived } = req.query;
  const bnsUsers = await prisma.user.findMany({
    where: {
      isArchived: isArchived === "true",
      role: "2",
    },
  });
  res.json(bnsUsers);
});

// Endpoint to restore archived BNS user
router.patch("/bns/restore/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const restoredUser = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: { isArchived: false },
    });
    res.json(restoredUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to restore BNS user" });
  }
});

// Endpoint to get archived beneficiary types
router.get("/types", async (req, res) => {
  const { isArchived } = req.query;
  try {
    const types = await prisma.type.findMany({
      where: { isArchived: isArchived === "true" },
    });
    res.json(types);
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({ error: "Failed to fetch types" });
  }
});

// Endpoint to restore archived beneficiary type
router.patch("/types/restore/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const restoredType = await prisma.type.update({
      where: { typeId: parseInt(id) },
      data: { isArchived: false },
    });
    res.json(restoredType);
  } catch (error) {
    console.error("Error restoring type:", error);
    res.status(500).json({ error: "Failed to restore beneficiary type" });
  }
});

// Endpoint to get archived events
router.get("/events", async (req, res) => {
  const { isArchived } = req.query;
  const events = await prisma.event.findMany({
    where: { isArchived: isArchived === "true" },
    include: {
      user: true, // Include the user information
    },
  });
  res.json(events);
});

// Endpoint to restore archived event
router.patch("/events/restore/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const restoredEvent = await prisma.event.update({
      where: { eventId: parseInt(id) },
      data: { isArchived: false },
    });
    res.json(restoredEvent);
  } catch (error) {
    res.status(500).json({ error: "Failed to restore event" });
  }
});

module.exports = router;
