const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async function (req, res, next) {
  try {
    // Fetch users with the role "2" from the database
    const bnsUsers = await prisma.user.findMany({
      where: {
        role: "2",
      },
      select: {
        user_id: true,
        firstName: true, // Adjust these fields if necessary to match your Prisma model
        lastName: true,
      },
    });
    res.json(bnsUsers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
