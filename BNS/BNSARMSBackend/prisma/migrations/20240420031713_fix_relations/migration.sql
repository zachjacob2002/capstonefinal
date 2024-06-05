-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "sex" TEXT NOT NULL DEFAULT 'Male',
    "barangay" TEXT NOT NULL DEFAULT 'Default Barangay',

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "beneficiaries" (
    "beneficiary_id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "purok" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "job" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "beneficiaries_pkey" PRIMARY KEY ("beneficiary_id")
);

-- CreateTable
CREATE TABLE "activities" (
    "activity_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activity_date" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "activity_participation" (
    "activity_id" INTEGER NOT NULL,
    "beneficiary_id" INTEGER NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "activity_participation_pkey" PRIMARY KEY ("activity_id","beneficiary_id")
);

-- CreateTable
CREATE TABLE "reports" (
    "report_id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "feedback" TEXT,
    "user_id" INTEGER NOT NULL,
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filePath" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "file_attachments" (
    "file_id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,

    CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("file_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participation" ADD CONSTRAINT "activity_participation_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participation" ADD CONSTRAINT "activity_participation_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("beneficiary_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("report_id") ON DELETE RESTRICT ON UPDATE CASCADE;
