const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

// POST endpoint for checking duplicate type name
router.post("/check-duplicate", async (req, res) => {
  const { typeName } = req.body;
  try {
    const existingType = await prisma.type.findFirst({
      where: { typeName },
    });
    res.json({ isDuplicate: !!existingType });
  } catch (error) {
    console.error("Error checking duplicate type name:", error);
    res.status(500).send("Internal Server Error");
  }
});

// POST endpoint for creating a new type
router.post("/", async (req, res) => {
  const { typeName, ageGroups, sex, subTypes } = req.body;
  try {
    const newType = await prisma.type.create({
      data: {
        typeName,
        ageGroups,
        sex,
        subTypes,
      },
    });
    console.log("New type created:", newType);
    res.status(201).json(newType);
  } catch (error) {
    console.error("Error creating new type:", error);
    res.status(500).send("Internal Server Error");
  }
});

// GET endpoint for fetching all types that are not archived
router.get("/", async (req, res) => {
  try {
    const types = await prisma.type.findMany({
      where: { isArchived: false },
    });
    res.json(types);
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add this new endpoint for archiving a type
router.patch("/archive/:typeId", async (req, res) => {
  const { typeId } = req.params;
  try {
    const updatedType = await prisma.type.update({
      where: { typeId: parseInt(typeId, 10) },
      data: { isArchived: true },
    });
    console.log("Type archived:", updatedType);
    res.status(200).json(updatedType);
  } catch (error) {
    console.error("Error archiving type:", error);
    res.status(500).send("Internal Server Error");
  }
});

// PUT endpoint for updating an existing type
// PUT endpoint for updating a type
router.put("/:typeId", async (req, res) => {
  const { typeId } = req.params;
  const { typeName, ageGroups, sex, subTypes } = req.body;
  try {
    const updatedType = await prisma.type.update({
      where: { typeId: parseInt(typeId, 10) },
      data: {
        typeName,
        ageGroups,
        sex,
        subTypes,
      },
    });
    console.log("Type updated:", updatedType);
    res.status(200).json(updatedType);
  } catch (error) {
    console.error("Error updating type:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/typesforparticipation", async (req, res) => {
  const { ageGroup } = req.query;

  try {
    const types = await prisma.type.findMany({
      where: {
        isArchived: false,
        ageGroups: {
          has: ageGroup, // Filter types by the selected age group
        },
      },
      select: {
        typeId: true,
        typeName: true,
        subTypes: true,
      },
    });

    res.status(200).json(types);
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({ error: "Internal Server Error for Types" });
  }
});

// Inside the router code

// POST endpoint for checking duplicate subtypes
router.post("/check-duplicate-subtype", async (req, res) => {
  const { subtype } = req.body;
  try {
    const existingSubtype = await prisma.type.findFirst({
      where: {
        subTypes: {
          has: subtype,
        },
      },
    });
    res.json({ isDuplicate: !!existingSubtype });
  } catch (error) {
    console.error("Error checking duplicate subtype:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
