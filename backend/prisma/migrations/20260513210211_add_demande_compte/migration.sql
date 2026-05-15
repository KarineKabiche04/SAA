-- CreateTable
CREATE TABLE "DemandeCompte" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "wilaya" TEXT NOT NULL,
    "message" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemandeCompte_pkey" PRIMARY KEY ("id")
);
