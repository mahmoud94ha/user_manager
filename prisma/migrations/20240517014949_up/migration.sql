-- CreateTable
CREATE TABLE "BannedIP" (
    "id" SERIAL NOT NULL,
    "ipAddress" TEXT NOT NULL,

    CONSTRAINT "BannedIP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BannedIP_ipAddress_key" ON "BannedIP"("ipAddress");
