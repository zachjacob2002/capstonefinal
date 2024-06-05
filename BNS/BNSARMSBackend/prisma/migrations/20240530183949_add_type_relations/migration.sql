-- AlterTable
ALTER TABLE "types" ADD COLUMN     "parentTypeId" INTEGER;

-- AddForeignKey
ALTER TABLE "types" ADD CONSTRAINT "types_parentTypeId_fkey" FOREIGN KEY ("parentTypeId") REFERENCES "types"("type_id") ON DELETE SET NULL ON UPDATE CASCADE;
