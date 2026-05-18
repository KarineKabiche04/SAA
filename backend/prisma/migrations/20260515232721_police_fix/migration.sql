/*
  Warnings:

  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DemandeCompte` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Devis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sinistre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vehicule` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT', 'CLIENT');

-- CreateEnum
CREATE TYPE "StatutVehicule" AS ENUM ('ACTIF', 'EXPIRE', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "StatutSinistre" AS ENUM ('EN_COURS', 'TRAITE', 'REFUSE');

-- CreateEnum
CREATE TYPE "StatutDevis" AS ENUM ('EN_ATTENTE', 'ACCEPTE', 'REFUSE');

-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REFUSEE');

-- CreateEnum
CREATE TYPE "StatutPolice" AS ENUM ('BROUILLON', 'EMISE', 'EXPIREE', 'RESILIEE', 'SUSPENDUE');

-- CreateEnum
CREATE TYPE "Fractionnement" AS ENUM ('ANNUEL', 'SEMESTRIEL', 'TRIMESTRIEL', 'MENSUEL');

-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('H', 'F');

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Devis" DROP CONSTRAINT "Devis_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Sinistre" DROP CONSTRAINT "Sinistre_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicule" DROP CONSTRAINT "Vehicule_userId_fkey";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "DemandeCompte";

-- DropTable
DROP TABLE "Devis";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "Sinistre";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Vehicule";

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicules" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "marque" TEXT NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "energie" TEXT NOT NULL DEFAULT 'ESSENCE',
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "statut" "StatutVehicule" NOT NULL DEFAULT 'ACTIF',
    "garanties" TEXT NOT NULL DEFAULT 'RC,DR',
    "prime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devis" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "statut" "StatutDevis" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sinistres" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "policeId" INTEGER,
    "ref" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lieu" TEXT,
    "statut" "StatutSinistre" NOT NULL DEFAULT 'EN_COURS',
    "montant" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contenu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sinistres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes_comptes" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "wilaya" TEXT NOT NULL,
    "message" TEXT,
    "statut" "StatutDemande" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demandes_comptes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "userId" INTEGER,
    "contenu" TEXT NOT NULL,
    "expediteur" TEXT NOT NULL DEFAULT 'client',
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polices" (
    "id" SERIAL NOT NULL,
    "numeroPolice" TEXT NOT NULL,
    "numeroAvenant" TEXT,
    "numeroGarantie" TEXT,
    "statut" "StatutPolice" NOT NULL DEFAULT 'BROUILLON',
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "agence" TEXT,
    "convention" TEXT,
    "sousConvention" TEXT,
    "refDossier" TEXT,
    "dateEffet" TIMESTAMP(3) NOT NULL,
    "heureEffet" TEXT,
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "duree" INTEGER,
    "souscritLe" TIMESTAMP(3),
    "saisiLe" TIMESTAMP(3),
    "fractionnement" "Fractionnement" NOT NULL DEFAULT 'ANNUEL',
    "contratFerme" BOOLEAN NOT NULL DEFAULT false,
    "tarif" TEXT,
    "typeContrat" TEXT,
    "type" TEXT,
    "reduction" TEXT,
    "regime" TEXT,
    "montantTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "primeNette" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nomAssure" TEXT,
    "codeAssure" TEXT,
    "qualite" TEXT,
    "typePiece" TEXT,
    "numPieceIdentite" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "wilaya" TEXT,
    "profession" TEXT,
    "activite" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "conducteurNom" TEXT,
    "conducteurAge" INTEGER,
    "sexe" "Sexe",
    "datePermis" TIMESTAMP(3),
    "genreVehicule" TEXT,
    "usage" TEXT,
    "typeDimension" TEXT,
    "nombreDimension" INTEGER DEFAULT 1,
    "exoneration" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicules_immatriculation_key" ON "vehicules"("immatriculation");

-- CreateIndex
CREATE UNIQUE INDEX "sinistres_ref_key" ON "sinistres"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "polices_numeroPolice_key" ON "polices"("numeroPolice");

-- CreateIndex
CREATE INDEX "polices_numeroPolice_idx" ON "polices"("numeroPolice");

-- CreateIndex
CREATE INDEX "polices_dateEcheance_idx" ON "polices"("dateEcheance");

-- CreateIndex
CREATE INDEX "polices_statut_idx" ON "polices"("statut");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicules" ADD CONSTRAINT "vehicules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicules" ADD CONSTRAINT "vehicules_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinistres" ADD CONSTRAINT "sinistres_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinistres" ADD CONSTRAINT "sinistres_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinistres" ADD CONSTRAINT "sinistres_policeId_fkey" FOREIGN KEY ("policeId") REFERENCES "polices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polices" ADD CONSTRAINT "polices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polices" ADD CONSTRAINT "polices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polices" ADD CONSTRAINT "polices_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "vehicules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
