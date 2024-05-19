/*
  Warnings:

  - You are about to drop the `AccountAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EAccounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountAssignment" DROP CONSTRAINT "AccountAssignment_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountAssignment" DROP CONSTRAINT "AccountAssignment_userId_fkey";

-- DropTable
DROP TABLE "AccountAssignment";

-- DropTable
DROP TABLE "EAccounts";

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "ip" TEXT,
    "location" TEXT,
    "verified" BOOLEAN,
    "online" BOOLEAN,
    "banMessage" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
