-- CreateTable
CREATE TABLE "PlottLifeContract" (
    "plottContractId" BIGINT NOT NULL,
    "externalId" TEXT,
    "no" TEXT,
    "status" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "plottUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlottLifeContract_pkey" PRIMARY KEY ("plottContractId")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "plottContractId" BIGINT NOT NULL,
    "externalId" TEXT NOT NULL,
    "buildingUnitTypeId" BIGINT,
    "buildingUnitTypeExternalId" TEXT,
    "roomTitle" TEXT,
    "roomCity" TEXT,
    "roomThumb" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "deposit" INTEGER NOT NULL DEFAULT 0,
    "rentFeePerWeek" INTEGER NOT NULL DEFAULT 0,
    "totalRentFee" INTEGER NOT NULL DEFAULT 0,
    "discountedRentFee" INTEGER NOT NULL DEFAULT 0,
    "cleaningFee" INTEGER NOT NULL DEFAULT 0,
    "managementFeePerWeek" INTEGER NOT NULL DEFAULT 0,
    "totalManagementFee" INTEGER NOT NULL DEFAULT 0,
    "totalPrice" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlottLifeContract_externalId_key" ON "PlottLifeContract"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_plottContractId_key" ON "Reservation"("plottContractId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_externalId_key" ON "Reservation"("externalId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_plottContractId_fkey" FOREIGN KEY ("plottContractId") REFERENCES "PlottLifeContract"("plottContractId") ON DELETE CASCADE ON UPDATE CASCADE;
