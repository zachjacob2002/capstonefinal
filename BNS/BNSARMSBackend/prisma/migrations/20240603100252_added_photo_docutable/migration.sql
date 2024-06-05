-- CreateTable
CREATE TABLE "activity_documentations" (
    "documentation_id" SERIAL NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_documentations_pkey" PRIMARY KEY ("documentation_id")
);

-- AddForeignKey
ALTER TABLE "activity_documentations" ADD CONSTRAINT "activity_documentations_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;
