/*
  Warnings:

  - Made the column `createdAt` on table `customers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `banned` on table `customers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "banned" SET NOT NULL,
ALTER COLUMN "banned" SET DEFAULT false;
