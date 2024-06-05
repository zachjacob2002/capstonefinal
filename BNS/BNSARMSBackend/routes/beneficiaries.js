const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router(); // Initialize the router

// POST endpoint for creating a new beneficiary
// POST endpoint for creating a new beneficiary
router.post("/", async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    birthdate,
    barangay,
    healthStation,
    sex,
    job,
    primaryType,
    civilStatus,
    contactNumber,
    secondaryTypes,
    tertiaryType,
  } = req.body;

  try {
    // Calculate age
    const calculateAge = (birthdate) => {
      const birth = new Date(birthdate);
      const today = new Date();
      let years = today.getFullYear() - birth.getFullYear();
      const months = today.getMonth() - birth.getMonth();
      if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
        years--;
      }
      return `${years} Years`;
    };

    const age = calculateAge(birthdate);

    // Create the new beneficiary
    const newBeneficiary = await prisma.beneficiary.create({
      data: {
        firstName,
        middleName,
        lastName,
        suffix,
        birthdate: new Date(birthdate),
        age,
        barangay,
        healthStation: String(healthStation), // Convert to string
        sex,
        job,
        primaryType,
        civilStatus,
        contactNumber,
        beneficiaryTypes: {
          create: [
            ...secondaryTypes.map((typeId) => ({
              typeId,
            })),
            ...(tertiaryType ? [{ typeId: tertiaryType }] : []),
          ],
        },
      },
    });

    res.status(201).json(newBeneficiary);
  } catch (error) {
    console.error("Error creating beneficiary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint to fetch all unarchived beneficiaries
router.get("/", async (req, res) => {
  try {
    const beneficiaries = await prisma.beneficiary.findMany({
      where: { isArchived: false },
      include: {
        beneficiaryTypes: {
          include: {
            type: true,
          },
        },
      },
    });

    const formattedBeneficiaries = beneficiaries.map((beneficiary) => ({
      beneficiaryId: beneficiary.beneficiaryId,
      firstName: beneficiary.firstName,
      middleName: beneficiary.middleName,
      lastName: beneficiary.lastName,
      suffix: beneficiary.suffix,
      birthdate: beneficiary.birthdate,
      age: beneficiary.age,
      sex: beneficiary.sex,
      job: beneficiary.job,
      barangay: beneficiary.barangay,
      healthStation: beneficiary.healthStation,
      primaryType: beneficiary.primaryType,
      civilStatus: beneficiary.civilStatus,
      contactNumber: beneficiary.contactNumber,
      secondaryTypeIds: beneficiary.beneficiaryTypes
        .filter((bt) => bt.type.typeCategory === "Secondary")
        .map((bt) => bt.typeId),
      secondaryTypeNames: beneficiary.beneficiaryTypes
        .filter((bt) => bt.type.typeCategory === "Secondary")
        .map((bt) => bt.type.typeName),
      tertiaryTypeId: beneficiary.beneficiaryTypes.find(
        (bt) => bt.type.typeCategory === "Tertiary"
      )?.typeId,
      tertiaryTypeName:
        beneficiary.beneficiaryTypes.find(
          (bt) => bt.type.typeCategory === "Tertiary"
        )?.type.typeName || "",
    }));

    res.status(200).json(formattedBeneficiaries);
  } catch (error) {
    console.error("Error fetching beneficiaries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// GET endpoint to check if a beneficiary exists
router.get("/exists", async (req, res) => {
  const { firstName, middleName, lastName, suffix } = req.query;

  try {
    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        firstName,
        middleName,
        lastName,
        suffix,
      },
    });

    if (beneficiary) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking beneficiary existence:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH endpoint for archiving a beneficiary
router.patch("/archive/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const archivedBeneficiary = await prisma.beneficiary.update({
      where: { beneficiaryId: parseInt(id) },
      data: { isArchived: true },
    });

    res.status(200).json(archivedBeneficiary);
  } catch (error) {
    console.error("Error archiving beneficiary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH endpoint for updating a beneficiary
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    birthdate,
    barangay,
    healthStation,
    sex,
    job,
    primaryType,
    civilStatus,
    contactNumber,
    secondaryTypes,
    tertiaryType,
  } = req.body;

  try {
    // Calculate age
    const calculateAge = (birthdate) => {
      const birth = new Date(birthdate);
      const today = new Date();
      let years = today.getFullYear() - birth.getFullYear();
      const months = today.getMonth() - birth.getMonth();
      if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
        years--;
      }
      return `${years} Years`;
    };

    const age = calculateAge(birthdate);

    // Update the beneficiary
    const updatedBeneficiary = await prisma.beneficiary.update({
      where: { beneficiaryId: parseInt(id) },
      data: {
        firstName,
        middleName,
        lastName,
        suffix,
        birthdate: new Date(birthdate),
        age,
        barangay,
        healthStation: String(healthStation), // Convert to string
        sex,
        job,
        primaryType,
        civilStatus,
        contactNumber,
        beneficiaryTypes: {
          deleteMany: {}, // Delete existing types
          create: [
            ...secondaryTypes.map((typeId) => ({
              typeId,
            })),
            ...(tertiaryType ? [{ typeId: tertiaryType }] : []),
          ],
        },
      },
    });

    res.status(200).json(updatedBeneficiary);
  } catch (error) {
    console.error("Error updating beneficiary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
