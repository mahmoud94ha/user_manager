/*
  Warnings:

  - A unique constraint covering the columns `[ipAddress,lastPage]` on the table `Visitor` will be added. If there are existing duplicate values, this will fail.
  - Made the column `lastPage` on table `Visitor` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Visitor_ipAddress_key";

-- AlterTable
ALTER TABLE "Visitor" ALTER COLUMN "lastPage" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_ipAddress_lastPage_key" ON "Visitor"("ipAddress", "lastPage");
