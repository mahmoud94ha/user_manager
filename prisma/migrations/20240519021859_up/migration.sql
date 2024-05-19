-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "autoBackupEnabled" BOOLEAN NOT NULL DEFAULT false,
    "backupTimeout" INTEGER,
    "summaryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "userNotificationEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
