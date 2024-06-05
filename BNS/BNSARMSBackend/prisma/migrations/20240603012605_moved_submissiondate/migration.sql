/*
  Warnings:

  - You are about to drop the column `submissionDate` on the `reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "reports" DROP COLUMN "submissionDate";

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
