/*
  Warnings:

  - You are about to drop the column `primaryType` on the `beneficiaries` table. All the data in the column will be lost.
  - You are about to drop the column `parentTypeId` on the `types` table. All the data in the column will be lost.
  - You are about to drop the column `typeCategory` on the `types` table. All the data in the column will be lost.
  - You are about to drop the `primary_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `type_primary_types` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ageGroup` to the `beneficiaries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "type_primary_types" DROP CONSTRAINT "type_primary_types_primaryTypeId_fkey";

-- DropForeignKey
ALTER TABLE "type_primary_types" DROP CONSTRAINT "type_primary_types_typeId_fkey";

-- DropForeignKey
ALTER TABLE "types" DROP CONSTRAINT "types_parentTypeId_fkey";

-- AlterTable
ALTER TABLE "beneficiaries" DROP COLUMN "primaryType",
ADD COLUMN     "ageGroup" TEXT NOT NULL,
ADD COLUMN     "subType" TEXT;

-- AlterTable
ALTER TABLE "types" DROP COLUMN "parentTypeId",
DROP COLUMN "typeCategory",
ADD COLUMN     "ageGroups" TEXT[],
ADD COLUMN     "subTypes" TEXT[];

-- DropTable
DROP TABLE "primary_types";

-- DropTable
DROP TABLE "type_primary_types";
