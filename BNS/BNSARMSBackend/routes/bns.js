const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  console.log("Received request to /bns/add with data:", req.body);
  const { firstName, lastName, username, password, sex, barangay } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        password,
        role: "2", // Set role as '2'
        sex,
        barangay,
      },
    });
    console.log("New user created:", newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "2", // Filter to only fetch users with role "2"
      },
    });
    const formattedUsers = users.map((e) => ({
      firstName: e.firstName,
      lastName: e.lastName,
      sex: e.sex,
      barangay: e.barangay,
      username: e.username,
      password: e.password, // Include password in the response
      id: e.user_id,
    }));
    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, username, password, sex, barangay } = req.body;

  const userId = parseInt(id);
  if (isNaN(userId)) {
    return res.status(400).send("Invalid user ID.");
  }

  try {
    // Retrieve the existing user first
    const existingUser = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!existingUser) {
      return res.status(404).send("User not found.");
    }

    // Check if the username has changed and if it's in use by another user
    if (username !== existingUser.username) {
      const usernameExists = await prisma.user.findFirst({
        where: {
          username,
          NOT: {
            user_id: userId,
          },
        },
      });

      if (usernameExists) {
        return res.status(409).send("Username already in use by another user.");
      }
    }

    // Proceed with the update if no conflicts
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: {
        firstName,
        lastName,
        username,
        password,
        sex,
        barangay,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).send("Failed to update user: " + error.message);
  }
});

router.patch("/archive/:id", async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return res.status(400).send("Invalid user ID.");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return res.status(404).send("User not found. ID: " + userId);
    }

    const archivedUser = await prisma.user.update({
      where: { user_id: userId },
      data: { isArchived: true },
    });

    res
      .status(200)
      .json({ message: "User archived successfully", archivedUser });
  } catch (error) {
    console.error("Failed to archive user:", error);
    res.status(500).send("Failed to archive user: " + error.message);
  }
});

router.put("/manage-account", async (req, res) => {
  const { userId, firstName, lastName, username, password, sex, barangay } =
    req.body;

  if (isNaN(userId)) {
    return res.status(400).send("Invalid user ID.");
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!existingUser) {
      return res.status(404).send("User not found.");
    }

    if (username !== existingUser.username) {
      const usernameExists = await prisma.user.findFirst({
        where: {
          username,
          NOT: {
            user_id: userId,
          },
        },
      });

      if (usernameExists) {
        return res.status(409).send("Username already in use by another user.");
      }
    }

    const updatedUserData = {
      firstName,
      lastName,
      username,
      sex,
      barangay,
    };

    if (password) {
      updatedUserData.password = password;
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: updatedUserData,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).send("Failed to update user: " + error.message);
  }
});

router.get("/feedback/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user details from the database
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send user details as response
    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      sex: user.sex,
      barangay: user.barangay,
    });
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

module.exports = router;
