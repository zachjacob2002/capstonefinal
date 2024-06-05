const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router(); // Initialize the router

// GET endpoint to fetch notifications for a user
router.get("/", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: parseInt(userId, 10), // Ensure userId is an integer
      },
      orderBy: {
        createdAt: "desc", // Optional: Orders notifications by creation date
      },
    });

    res.json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    res.status(500).json({ message: "Error fetching notifications", error });
  }
});

router.patch("/read", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: parseInt(userId, 10),
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    res
      .status(500)
      .json({ message: "Error marking notifications as read", error });
  }
});

router.delete("/clear", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    await prisma.notification.deleteMany({
      where: {
        userId: parseInt(userId, 10),
      },
    });

    res.status(200).json({ message: "Notifications cleared" });
  } catch (error) {
    console.error("Failed to clear notifications:", error);
    res.status(500).json({ message: "Error clearing notifications", error });
  }
});

module.exports = router;
