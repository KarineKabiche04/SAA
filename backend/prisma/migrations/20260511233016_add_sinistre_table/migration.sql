-- CreateTable
CREATE TABLE "Sinistre" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ref" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lieu" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN COURS',
    "montant" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contenu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sinistre_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sinistre" ADD CONSTRAINT "Sinistre_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
