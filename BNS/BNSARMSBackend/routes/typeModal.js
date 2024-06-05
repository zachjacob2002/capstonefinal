// typeModal.js

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router(); // Initialize the router

router.get("/sex-options", async (req, res) => {
  try {
    const sexOptions = await prisma.type.findMany({
      select: {
        sex: true,
      },
      distinct: ["sex"],
    });

    const filteredSexOptions = sexOptions
      .map((option) => option.sex)
      .filter(Boolean);

    res.status(200).json(filteredSexOptions);
  } catch (error) {
    console.error("Error fetching sex options:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/primary-types", async (req, res) => {
  try {
    const primaryTypes = await prisma.primaryType.findMany();
    res.status(200).json(primaryTypes);
  } catch (error) {
    console.error("Error fetching primary types:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/secondary-types", async (req, res) => {
  const { primaryTypeId, sex } = req.query;

  try {
    const secondaryTypeIds = await prisma.typePrimaryTypes.findMany({
      where: {
        primaryTypeId: parseInt(primaryTypeId),
      },
      select: {
        typeId: true,
      },
    });

    const secondaryTypes = await prisma.type.findMany({
      where: {
        typeId: {
          in: secondaryTypeIds.map((item) => item.typeId),
        },
        AND: [
          {
            OR: [{ sex: sex }, { sex: "Both" }, { sex: null }],
          },
          {
            typeCategory: "Secondary",
          },
        ],
      },
    });

    res.status(200).json(secondaryTypes);
  } catch (error) {
    console.error("Error fetching secondary types:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/tertiary-types", async (req, res) => {
  const { secondaryTypeId } = req.query;

  try {
    const tertiaryTypes = await prisma.type.findMany({
      where: {
        parentTypeId: parseInt(secondaryTypeId),
      },
    });

    res.status(200).json(tertiaryTypes);
  } catch (error) {
    console.error("Error fetching tertiary types:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
