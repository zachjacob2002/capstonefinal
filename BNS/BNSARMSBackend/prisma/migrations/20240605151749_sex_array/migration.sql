/*
  Warnings:

  - The `sex` column on the `types` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "types" DROP COLUMN "sex",
ADD COLUMN     "sex" TEXT[];
