/*
  Warnings:

  - You are about to drop the column `primaryType` on the `types` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "types" DROP COLUMN "primaryType";

-- CreateTable
CREATE TABLE "primary_types" (
    "primary_type_id" SERIAL NOT NULL,
    "typeName" TEXT NOT NULL,

    CONSTRAINT "primary_types_pkey" PRIMARY KEY ("primary_type_id")
);

-- CreateTable
CREATE TABLE "type_primary_types" (
    "typeId" INTEGER NOT NULL,
    "primaryTypeId" INTEGER NOT NULL,

    CONSTRAINT "type_primary_types_pkey" PRIMARY KEY ("typeId","primaryTypeId")
);

-- AddForeignKey
ALTER TABLE "type_primary_types" ADD CONSTRAINT "type_primary_types_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "types"("type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_primary_types" ADD CONSTRAINT "type_primary_types_primaryTypeId_fkey" FOREIGN KEY ("primaryTypeId") REFERENCES "primary_types"("primary_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;
