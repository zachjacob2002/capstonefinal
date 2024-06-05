/*
  Warnings:

  - You are about to drop the column `beneficiary_primary_type` on the `activity_participation` table. All the data in the column will be lost.
  - Added the required column `beneficiary_age_group` to the `activity_participation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activity_participation" DROP COLUMN "beneficiary_primary_type",
ADD COLUMN     "beneficiary_age_group" TEXT NOT NULL,
ADD COLUMN     "beneficiary_sub_type" TEXT;
