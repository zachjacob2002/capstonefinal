const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router(); // Initialize the router

// POST endpoint for creating a new type
router.post("/", async (req, res) => {
  const { typeName, typeCategory, parentTypeId, primaryTypeIds, sex } =
    req.body;

  try {
    let inheritedSex = sex;
    let inheritedPrimaryTypeIds = primaryTypeIds;

    if (typeCategory === "Tertiary" && parentTypeId) {
      const parentType = await prisma.type.findUnique({
        where: { typeId: Number(parentTypeId) },
        include: { primaryTypes: true },
      });

      if (parentType) {
        inheritedSex = parentType.sex;
        inheritedPrimaryTypeIds = parentType.primaryTypes.map(
          (pt) => pt.primaryTypeId
        );
      }
    }

    const newType = await prisma.type.create({
      data: {
        typeName,
        typeCategory,
        parentType: parentTypeId
          ? { connect: { typeId: Number(parentTypeId) } }
          : undefined,
        sex: inheritedSex,
        primaryTypes: {
          create: inheritedPrimaryTypeIds.map((primaryTypeId) => ({
            primaryType: { connect: { primaryTypeId: Number(primaryTypeId) } },
          })),
        },
      },
    });

    res.status(201).json(newType);
  } catch (error) {
    console.error("Error creating type:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint for fetching all types// GET endpoint for fetching all types
router.get("/", async (req, res) => {
  try {
    const types = await prisma.type.findMany({
      where: {
        isArchived: false, // Fetch only non-archived types
      },
      include: {
        primaryTypes: {
          include: {
            primaryType: true,
          },
        },
        parentType: true, // Include the parent type information
      },
    });
    res.status(200).json(types);
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint for fetching secondary types
router.get("/secondary", async (req, res) => {
  try {
    const secondaryTypes = await prisma.type.findMany({
      where: {
        typeCategory: "Secondary",
      },
    });
    res.status(200).json(secondaryTypes);
  } catch (error) {
    console.error("Error fetching secondary types:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get secondary types based on primary type
router.get("/secondary/by-primary/:primaryTypeId", async (req, res) => {
  const { primaryTypeId } = req.params;

  try {
    const secondaryTypes = await prisma.type.findMany({
      where: {
        TypePrimaryTypes: {
          some: {
            primaryTypeId: Number(primaryTypeId),
          },
        },
      },
    });
    res.status(200).json(secondaryTypes);
  } catch (error) {
    console.error("Error fetching secondary types by primary type:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint for fetching primary types
router.get("/primary", async (req, res) => {
  try {
    const primaryTypes = await prisma.primaryType.findMany();
    res.status(200).json(primaryTypes);
  } catch (error) {
    console.error("Error fetching primary types:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/secondary/by-primary/:primaryType/:sex", async (req, res) => {
  const { primaryType, sex } = req.params;

  try {
    const primaryTypeEntry = await prisma.primaryType.findFirst({
      where: { typeName: primaryType },
      select: { primaryTypeId: true },
    });

    if (!primaryTypeEntry) {
      return res.status(404).json({ error: "Primary type not found" });
    }

    const secondaryTypes = await prisma.type.findMany({
      where: {
        typeCategory: "Secondary",
        primaryTypes: {
          some: {
            primaryTypeId: primaryTypeEntry.primaryTypeId,
          },
        },
        OR: [{ sex: sex }, { sex: "Both" }],
      },
    });

    res.status(200).json(secondaryTypes);
  } catch (error) {
    console.error(
      "Error fetching secondary types by primary type and sex:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/tertiary/by-secondary/:secondaryTypeId", async (req, res) => {
  const { secondaryTypeId } = req.params;

  try {
    const secondaryType = await prisma.type.findUnique({
      where: { typeId: Number(secondaryTypeId) },
      select: { typeId: true },
    });

    if (!secondaryType) {
      return res.status(404).json({ error: "Secondary type not found" });
    }

    const tertiaryTypes = await prisma.type.findMany({
      where: {
        parentTypeId: secondaryType.typeId,
      },
    });

    res.status(200).json(tertiaryTypes);
  } catch (error) {
    console.error("Error fetching tertiary types by secondary type:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/types/:typeId", async (req, res) => {
  const { typeId } = req.params;

  try {
    // Delete related records in TypePrimaryTypes
    await prisma.typePrimaryTypes.deleteMany({
      where: { typeId: Number(typeId) },
    });

    // Delete the type
    await prisma.type.delete({
      where: { typeId: Number(typeId) },
    });

    res.status(200).json({ message: "Type deleted successfully" });
  } catch (error) {
    console.error("Error deleting type:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/types/:typeId", async (req, res) => {
  const { typeId } = req.params;

  try {
    const archivedType = await prisma.type.update({
      where: { typeId: Number(typeId) },
      data: { isArchived: true },
    });

    res
      .status(200)
      .json({ message: "Type archived successfully", archivedType });
  } catch (error) {
    console.error("Error archiving type:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
