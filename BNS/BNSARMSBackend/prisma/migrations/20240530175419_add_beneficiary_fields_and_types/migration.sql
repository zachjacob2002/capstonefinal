/*
  Warnings:

  - You are about to drop the column `beneficiary_type` on the `activity_participation` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `beneficiaries` table. All the data in the column will be lost.
  - Added the required column `beneficiary_civil_status` to the `activity_participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiary_primary_type` to the `activity_participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiary_types` to the `activity_participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `civilStatus` to the `beneficiaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryType` to the `beneficiaries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activity_participation" DROP COLUMN "beneficiary_type",
ADD COLUMN     "beneficiaryMiddleName" TEXT,
ADD COLUMN     "beneficiarySuffix" TEXT,
ADD COLUMN     "beneficiary_civil_status" TEXT NOT NULL,
ADD COLUMN     "beneficiary_contact_number" TEXT,
ADD COLUMN     "beneficiary_primary_type" TEXT NOT NULL,
ADD COLUMN     "beneficiary_types" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "beneficiaries" DROP COLUMN "type",
ADD COLUMN     "civilStatus" TEXT NOT NULL,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "primaryType" TEXT NOT NULL,
ADD COLUMN     "suffix" TEXT;

-- CreateTable
CREATE TABLE "types" (
    "type_id" SERIAL NOT NULL,
    "typeName" TEXT NOT NULL,
    "typeCategory" TEXT NOT NULL,
    "typeDescription" TEXT,

    CONSTRAINT "types_pkey" PRIMARY KEY ("type_id")
);

-- CreateTable
CREATE TABLE "beneficiary_types" (
    "beneficiary_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,

    CONSTRAINT "beneficiary_types_pkey" PRIMARY KEY ("beneficiary_id","type_id")
);

-- AddForeignKey
ALTER TABLE "beneficiary_types" ADD CONSTRAINT "beneficiary_types_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("beneficiary_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_types" ADD CONSTRAINT "beneficiary_types_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "types"("type_id") ON DELETE RESTRICT ON UPDATE CASCADE;
