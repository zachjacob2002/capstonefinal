// testQuery.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const type = "Monthly Accomplishment Report"; // Example type
  const month = "06"; // Example month
  const year = 2024; // Example year

  try {
    // Log the parameters to ensure they are correct
    console.log(`Querying for type: ${type}, month: ${month}, year: ${year}`);

    // Perform the query
    const reports = await prisma.report.findMany({
      where: {
        type: type,
        month: month,
        year: year,
      },
    });

    // Log the results
    console.log("Reports:", JSON.stringify(reports, null, 2));
  } catch (error) {
    console.error("Error querying reports:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
