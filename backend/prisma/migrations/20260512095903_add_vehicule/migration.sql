-- CreateTable
CREATE TABLE "Vehicule" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "marque" TEXT NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "energie" TEXT NOT NULL DEFAULT 'ESSENCE',
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "garanties" TEXT NOT NULL DEFAULT 'RC,DR',
    "prime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
