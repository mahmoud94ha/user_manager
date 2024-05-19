-- CreateTable
CREATE TABLE "Visitor" (
    "id" SERIAL NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "lastPage" TEXT,
    "dateVisited" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_ipAddress_key" ON "Visitor"("ipAddress");
