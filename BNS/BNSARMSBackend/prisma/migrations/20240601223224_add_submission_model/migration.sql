/*
  Warnings:

  - Added the required column `fileName` to the `file_attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submission_id` to the `file_attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `due_date` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "submission_id" INTEGER;

-- AlterTable
ALTER TABLE "file_attachments" ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "submission_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "due_date" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "submissions" (
    "submission_id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("submission_id")
);

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("submission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("submission_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("report_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
