// activities.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const path = require("path");
const router = express.Router(); // Initialize the router

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

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

router.post("/", async (req, res) => {
  const { title, description, date, createdBy } = req.body;
  try {
    const newActivity = await prisma.activity.create({
      data: {
        title,
        description,
        activityDate: new Date(date),
        createdBy, // Directly use the ID from the request
      },
    });

    // Fetch the user who created the activity
    const creator = await prisma.user.findUnique({
      where: {
        user_id: createdBy,
      },
    });

    // Fetch all users with role "1" (admin or relevant users)
    const usersWithRole1 = await prisma.user.findMany({
      where: {
        role: "1",
      },
    });

    // Convert the month number to month name
    const monthName = getMonthName(new Date(date).getMonth() + 1);

    // Create notifications for each user with role "1"
    await prisma.notification.createMany({
      data: usersWithRole1.map((adminUser) => ({
        userId: adminUser.user_id,
        title: "New Activity Created",
        message: `${creator.firstName} ${
          creator.lastName
        } created an activity named "${title}" for ${monthName}  ${new Date(
          date
        ).getFullYear()}.`,
        type: "activity",
        read: false,
      })),
    });

    res.json(newActivity);
  } catch (error) {
    console.error("Error creating activity: ", error);
    res.status(500).send("Error creating new activity");
  }
});

router.get("/", async (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId) : null; // Get user ID from query parameter, or null if not provided
  try {
    const activities = await prisma.activity.findMany({
      where: {
        isArchived: false,
        ...(userId && { createdBy: userId }), // Filter activities by user ID if provided
      },
      include: {
        creator: true,
      },
    });
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).send("Failed to fetch activities");
  }
});

router.post("/activity-participations", async (req, res) => {
  const { activityId, beneficiaries } = req.body;
  if (!beneficiaries.every((id) => typeof id === "number")) {
    return res.status(400).send("All beneficiary IDs must be numbers.");
  }

  try {
    const participations = beneficiaries.map((beneficiaryId) => ({
      activityId: parseInt(activityId, 10), // Ensure activityId is an integer
      beneficiaryId,
      attended: false,
    }));

    const addedParticipations = await prisma.activityParticipation.createMany({
      data: participations,
    });

    res.status(201).json(addedParticipations);
  } catch (error) {
    console.error("Failed to create activity participations:", error);
    res.status(500).send("Error creating activity participations");
  }
});

router.get("/:activityId/beneficiaries", async (req, res) => {
  const activityId = parseInt(req.params.activityId, 10);
  try {
    const beneficiaries = await prisma.activityParticipation.findMany({
      where: { activityId: activityId },
      include: {
        beneficiary: true,
        // Including the attended status in the response
      },
    });
    res.json(
      beneficiaries.map((participation) => ({
        ...participation.beneficiary,
        attended: participation.attended, // Assuming attended is a direct field in the participation record
      }))
    );
  } catch (error) {
    console.error("Error fetching beneficiaries for activity:", error);
    res.status(500).send("Failed to fetch beneficiaries");
  }
});

// Update participation status in backend
router.patch("/activity-participations/update-attendance", async (req, res) => {
  const { activityId, beneficiaryIds, attended } = req.body;

  try {
    await prisma.activityParticipation.updateMany({
      where: {
        activityId: parseInt(activityId, 10),
        beneficiaryId: {
          in: beneficiaryIds,
        },
      },
      data: {
        attended: attended,
      },
    });

    res.status(200).send("Attendance updated successfully");
  } catch (error) {
    console.error("Failed to update participation attendance:", error);
    res.status(500).send("Error updating attendance");
  }
});

// New route to handle image uploads
router.post(
  "/upload-photos/:activityId",
  upload.array("photos", 4),
  async (req, res) => {
    const activityId = parseInt(req.params.activityId, 10);

    try {
      // Check if files exist
      if (!req.files || req.files.length === 0) {
        return res.status(400).send("No files were uploaded.");
      }

      // Save the uploaded photos' file information to the database
      const photos = req.files.map((file) => ({
        activityId: activityId,
        filename: file.filename,
        filepath: file.path,
      }));

      const savedPhotos = await prisma.activityDocumentation.createMany({
        data: photos,
      });

      res.status(201).json(savedPhotos);
    } catch (error) {
      console.error("Failed to upload photos:", error);
      res.status(500).send("Error uploading photos");
    }
  }
);

// New route to fetch photos for an activity
router.get("/photos/:activityId", async (req, res) => {
  const activityId = parseInt(req.params.activityId, 10);

  try {
    const photos = await prisma.activityDocumentation.findMany({
      where: {
        activityId: activityId,
      },
    });
    res.json(photos);
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    res.status(500).send("Error fetching photos");
  }
});

router.get("/get-image/:activityId/:beneficiaryId", async (req, res) => {
  try {
    const { activityId, beneficiaryId } = req.params;
    const participation = await prisma.activityParticipation.findUnique({
      where: {
        activityId_beneficiaryId: {
          activityId: parseInt(activityId, 10),
          beneficiaryId: parseInt(beneficiaryId, 10),
        },
      },
    });
    if (participation && participation.filepath) {
      res.json({ filepath: participation.filepath });
    } else {
      res.status(404).json({ filepath: null, message: "Image not found" });
    }
  } catch (error) {
    console.error("Failed to fetch image:", error);
    res.status(500).send("Error fetching image");
  }
});

router.delete(
  "/activity-participations/:activityId/:beneficiaryId",
  async (req, res) => {
    const { activityId, beneficiaryId } = req.params;
    console.log(
      `Received delete request for Activity ID: ${activityId}, Beneficiary ID: ${beneficiaryId}`
    ); // Log the received IDs

    try {
      const result = await prisma.activityParticipation.delete({
        where: {
          activityId_beneficiaryId: {
            activityId: parseInt(activityId, 10),
            beneficiaryId: parseInt(beneficiaryId, 10),
          },
        },
      });
      console.log("Deletion successful:", result); // Log the result of the deletion
      res
        .status(200)
        .json({ message: "Beneficiary removed successfully", result });
    } catch (error) {
      console.error("Failed to remove beneficiary:", error);
      res.status(500).send("Error removing beneficiary");
    }
  }
);

// New DELETE endpoint to delete an activity and its participations
router.delete("/:activityId", async (req, res) => {
  const activityId = parseInt(req.params.activityId, 10);

  try {
    // Delete the participations first
    await prisma.activityParticipation.deleteMany({
      where: {
        activityId: activityId,
      },
    });

    // Delete the activity
    const deletedActivity = await prisma.activity.delete({
      where: {
        activityId: activityId,
      },
    });

    res.status(200).json(deletedActivity);
  } catch (error) {
    console.error("Error deleting activity: ", error);
    res.status(500).send("Error deleting activity");
  }
});

router.patch("/:activityId", async (req, res) => {
  const activityId = parseInt(req.params.activityId, 10);
  const { title, description, date } = req.body;

  try {
    const updatedActivity = await prisma.activity.update({
      where: { activityId },
      data: {
        title,
        description,
        activityDate: new Date(date),
      },
    });

    res.status(200).json(updatedActivity);
  } catch (error) {
    console.error("Error updating activity: ", error);
    res.status(500).send("Error updating activity");
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        firstName: true,
        lastName: true,
      },
    });
    res.json(
      users.map((user) => ({
        id: user.user_id,
        firstName: user.firstName,
        lastName: user.lastName,
      }))
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Failed to fetch users");
  }
});

// Add this route to fetch attendance data for an activity
router.get("/:activityId/attendance", async (req, res) => {
  const activityId = parseInt(req.params.activityId, 10);
  try {
    const attendanceData = await prisma.activityParticipation.aggregate({
      where: { activityId: activityId },
      _count: {
        attended: true,
        _all: true,
      },
    });
    res.json({
      attended: attendanceData._count.attended,
      total: attendanceData._count._all,
    });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    res.status(500).send("Failed to fetch attendance data");
  }
});

router.patch("/archive/:activityId", async (req, res) => {
  const activityId = parseInt(req.params.activityId, 10);

  try {
    const archivedActivity = await prisma.activity.update({
      where: { activityId },
      data: { isArchived: true },
    });
    res.json(archivedActivity);
  } catch (error) {
    console.error("Error archiving activity: ", error);
    res.status(500).send("Error archiving activity");
  }
});

// New route to fetch photos for an activity
router.get("/photos/:activityId", async (req, res) => {
  const activityId = parseInt(req.params.activityId, 10);

  try {
    const photos = await prisma.activityDocumentation.findMany({
      where: {
        activityId: activityId,
      },
    });
    res.json(photos);
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    res.status(500).send("Error fetching photos");
  }
});



module.exports = router;
