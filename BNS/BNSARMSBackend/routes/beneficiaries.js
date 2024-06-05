// beneficiaries.js

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router(); // Initialize the router

// POST endpoint to add a new beneficiary
router.post("/", async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    birthdate,
    sex,
    job,
    barangay,
    healthStation,
    ageGroup,
    subType, // Ensure subType is included
    civilStatus,
    contactNumber,
    age, // Include age in the request body
    types, // Include types in the request body
  } = req.body;

  console.log("Request body:", req.body); // Log request body

  try {
    const newBeneficiary = await prisma.beneficiary.create({
      data: {
        firstName,
        middleName,
        lastName,
        suffix,
        birthdate: new Date(birthdate),
        sex,
        job,
        barangay,
        healthStation: healthStation.toString(), // Convert healthStation to string
        ageGroup,
        subType, // Save the subType
        civilStatus,
        contactNumber,
        age, // Save the age
      },
    });

    // Handle beneficiary types
    await prisma.beneficiaryTypes.createMany({
      data: types.map((typeId) => ({
        beneficiaryId: newBeneficiary.beneficiaryId,
        typeId,
      })),
    });

    console.log("New Beneficiary added:", newBeneficiary);
    res.status(201).json(newBeneficiary);
  } catch (error) {
    console.error("Error adding new beneficiary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint to fetch types based on age group and sex
router.get("/types", async (req, res) => {
  const { ageGroup, sex } = req.query;

  try {
    const types = await prisma.type.findMany({
      where: {
        ageGroups: {
          has: ageGroup,
        },
        sex: {
          has: sex,
        },
      },
    });
    res.status(200).json(types);
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint to fetch subtypes based on typeId
router.get("/subtypes", async (req, res) => {
  const { typeId } = req.query;

  try {
    const type = await prisma.type.findUnique({
      where: {
        typeId: parseInt(typeId),
      },
    });

    if (type) {
      res.status(200).json(type.subTypes);
    } else {
      res.status(404).json({ error: "Type not found" });
    }
  } catch (error) {
    console.error("Error fetching subtypes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/unarchived", async (req, res) => {
  try {
    const beneficiaries = await prisma.beneficiary.findMany({
      where: {
        isArchived: false,
      },
      include: {
        beneficiaryTypes: {
          include: {
            type: true,
          },
        },
      },
    });

    const formattedBeneficiaries = beneficiaries.map((beneficiary) => ({
      ...beneficiary,
      types: beneficiary.beneficiaryTypes.map((bt) => bt.type.typeName),
    }));

    res.status(200).json(formattedBeneficiaries);
  } catch (error) {
    console.error("Error fetching unarchived beneficiaries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT endpoint to update a beneficiary
router.put("/:beneficiaryId", async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    birthdate,
    sex,
    job,
    barangay,
    healthStation,
    ageGroup,
    subType, // Ensure subType is included
    civilStatus,
    contactNumber,
    age, // Include age in the request body
    types, // Include types in the request body
  } = req.body;
  const { beneficiaryId } = req.params;

  console.log("Request body for update:", req.body); // Log request body

  try {
    const updatedBeneficiary = await prisma.beneficiary.update({
      where: { beneficiaryId: parseInt(beneficiaryId) },
      data: {
        firstName,
        middleName,
        lastName,
        suffix,
        birthdate: new Date(birthdate),
        sex,
        job,
        barangay,
        healthStation: healthStation.toString(), // Convert healthStation to string
        ageGroup,
        subType, // Save the subType
        civilStatus,
        contactNumber,
        age, // Save the age
      },
    });

    // Update beneficiary types
    await prisma.beneficiaryTypes.deleteMany({
      where: { beneficiaryId: parseInt(beneficiaryId) },
    });

    await prisma.beneficiaryTypes.createMany({
      data: types.map((typeId) => ({
        beneficiaryId: parseInt(beneficiaryId),
        typeId,
      })),
    });

    console.log("Beneficiary successfully updated:", updatedBeneficiary);
    res.status(200).json(updatedBeneficiary);
  } catch (error) {
    console.error("Error updating beneficiary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint to check if a beneficiary exists based on first, middle, and last name
router.get("/check-existing", async (req, res) => {
  const { firstName, middleName, lastName } = req.query;

  try {
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        firstName,
        middleName,
        lastName,
      },
    });

    if (existingBeneficiary) {
      res.status(200).json({ exists: true, beneficiary: existingBeneficiary });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking existing beneficiary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/archive/:beneficiaryId", async (req, res) => {
  const { beneficiaryId } = req.params;

  try {
    const archivedBeneficiary = await prisma.beneficiary.update({
      where: { beneficiaryId: parseInt(beneficiaryId) },
      data: {
        isArchived: true,
      },
    });

    console.log("Beneficiary successfully archived:", archivedBeneficiary);
    res.status(200).json(archivedBeneficiary);
  } catch (error) {
    console.error("Error archiving beneficiary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
