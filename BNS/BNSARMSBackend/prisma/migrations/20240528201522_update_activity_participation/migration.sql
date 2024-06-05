/*
  Warnings:

  - You are about to drop the column `filename` on the `activity_participation` table. All the data in the column will be lost.
  - You are about to drop the column `filepath` on the `activity_participation` table. All the data in the column will be lost.
  - Added the required column `beneficiary_barangay` to the `activity_participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiary_birthdate` to the `activity_participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiary_first_name` to the `activity_participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiary_health_station` to the `activity_participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiary_last_name` to the `activity_participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiary_sex` to the `activity_participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiary_type` to the `activity_participation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activity_participation" DROP COLUMN "filename",
DROP COLUMN "filepath",
ADD COLUMN     "beneficiary_barangay" TEXT NOT NULL,
ADD COLUMN     "beneficiary_birthdate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "beneficiary_first_name" TEXT NOT NULL,
ADD COLUMN     "beneficiary_health_station" TEXT NOT NULL,
ADD COLUMN     "beneficiary_job" TEXT,
ADD COLUMN     "beneficiary_last_name" TEXT NOT NULL,
ADD COLUMN     "beneficiary_sex" TEXT NOT NULL,
ADD COLUMN     "beneficiary_type" TEXT NOT NULL;
