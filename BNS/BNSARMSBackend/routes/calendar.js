const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all unarchived events
router.get("/", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        isArchived: false, // Fetch only unarchived events
      },
      include: {
        user: true,
      },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event
router.post("/", async (req, res) => {
  const { title, start, end, allDay, createdBy } = req.body;
  try {
    const newEvent = await prisma.event.create({
      data: {
        title,
        start: new Date(start),
        end: end ? new Date(end) : null,
        allDay,
        createdBy,
      },
    });

    // Fetch all users with role "2"
    const usersWithRole2 = await prisma.user.findMany({
      where: {
        role: "2",
      },
    });

    // Create notifications for each user with role "2"
    await prisma.notification.createMany({
      data: usersWithRole2.map((user) => ({
        userId: user.user_id,
        title: "New Upcoming Event",
        message: `New Event: "${title}" on ${new Date(
          start
        ).toLocaleDateString()}`,
        type: "event",
      })),
    });

    res.json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Archive an event
router.patch("/archive/:id", async (req, res) => {
  const { id } = req.params;
  console.log("PATCH /calendar/archive/:id request received with ID:", id);
  try {
    const archivedEvent = await prisma.event.update({
      where: { eventId: parseInt(id, 10) },
      data: { isArchived: true },
    });
    console.log("Event archived with ID:", id);
    res.json(archivedEvent);
  } catch (error) {
    console.error("Error archiving event:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
