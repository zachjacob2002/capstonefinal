// participation.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/add", async (req, res) => {
  const { activityId, beneficiaries } = req.body;

  try {
    const participationData = beneficiaries.map((beneficiary) => ({
      activityId: parseInt(activityId, 10),
      beneficiaryId: beneficiary.beneficiaryId,
      beneficiaryFirstName: beneficiary.firstName,
      beneficiaryMiddleName: beneficiary.middleName,
      beneficiaryLastName: beneficiary.lastName,
      beneficiarySuffix: beneficiary.suffix,
      beneficiaryBirthdate: new Date(beneficiary.birthdate),
      beneficiarySex: beneficiary.sex,
      beneficiaryJob: beneficiary.job,
      beneficiaryBarangay: beneficiary.barangay,
      beneficiaryHealthStation: beneficiary.healthStation,
      beneficiaryPrimaryType: beneficiary.primaryType,
      beneficiaryCivilStatus: beneficiary.civilStatus,
      beneficiaryContactNumber: beneficiary.contactNumber,
      beneficiaryTypes: beneficiary.types,
      attended: false, // Default value
    }));

    console.log("Participation Data to Insert:", participationData);

    // Create activity participations
    const result = await prisma.activityParticipation.createMany({
      data: participationData,
      skipDuplicates: true, // Avoids inserting duplicate records if they already exist
    });

    console.log("Insertion Result:", result);

    res
      .status(200)
      .json({ message: "Beneficiaries added to activity successfully." });
  } catch (error) {
    console.error("Error adding beneficiaries to activity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:activityId", async (req, res) => {
  const { activityId } = req.params;

  try {
    const participations = await prisma.activityParticipation.findMany({
      where: {
        activityId: parseInt(activityId, 10),
      },
    });

    res.status(200).json(participations);
  } catch (error) {
    console.error("Error fetching activity participations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/mark-attended", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.some((id) => id == null)) {
    return res.status(400).json({ error: "Invalid IDs provided" });
  }

  try {
    const result = await prisma.activityParticipation.updateMany({
      where: {
        beneficiaryId: { in: ids },
      },
      data: {
        attended: true,
      },
    });

    console.log("Mark As Attended Result:", result);

    res.status(200).json({
      message: "Selected beneficiaries marked as attended successfully.",
    });
  } catch (error) {
    console.error("Error marking as attended:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
