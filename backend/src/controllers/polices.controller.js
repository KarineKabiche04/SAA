import prisma from '../prisma.js'
import bcrypt from 'bcryptjs'

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/polices/mes-polices
// ─────────────────────────────────────────────────────────────────────────────
export const mesPolices = async (req, res) => {
  try {
    const polices = await prisma.police.findMany({
      where: { userId: req.user.id },
      include: { vehicule: true },
      orderBy: { createdAt: 'desc' },
    })

    const result = polices.map(p => {
      const now           = new Date()
      const echeance      = new Date(p.dateEcheance)
      const joursRestants = Math.max(0, Math.ceil((echeance - now) / (1000 * 60 * 60 * 24)))
      const totalJours    = (p.duree || 12) * 30
      const pctRestant    = Math.min(100, Math.round((joursRestants / totalJours) * 100))
      let statutCalcule   = 'EN COURS'
      if (joursRestants <= 0)       statutCalcule = 'EXPIRÉE'
      else if (joursRestants <= 30) statutCalcule = 'EXPIRE BIENTÔT'

      return {
        id: p.id, numeroPolice: p.numeroPolice, statut: p.statut, statutCalcule,
        nomAssure: p.nomAssure, agence: p.agence, convention: p.convention,
        regime: p.regime, reduction: p.reduction, fractionnement: p.fractionnement,
        type: p.type, dateEffet: p.dateEffet, dateEcheance: p.dateEcheance,
        duree: p.duree, montantTotal: p.montantTotal, primeNette: p.primeNette,
        taxes: p.taxes, genreVehicule: p.genreVehicule, usage: p.usage,
        wilaya: p.wilaya, telephone: p.telephone, email: p.email,
        marque:          p.vehicule?.marque          ?? '—',
        immatriculation: p.vehicule?.immatriculation ?? '—',
        energie:         p.vehicule?.energie         ?? '—',
        garanties:       p.vehicule?.garanties?.split(',') ?? [],
        prime:           p.vehicule?.prime           ?? p.primeNette ?? 0,
        vehiculeId:      p.vehicule?.id,
        joursRestants, pctRestant,
      }
    })

    return res.json(result)
  } catch (err) {
    console.error('[MES POLICES]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/polices/all
// ─────────────────────────────────────────────────────────────────────────────
export const getAllPolices = async (req, res) => {
  try {
    const polices = await prisma.police.findMany({
      include: {
        vehicule: true,
        user: { select: { id: true, email: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(polices)
  } catch (err) {
    console.error('[ALL POLICES]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/polices/creer — Agent crée une police complète
// ─────────────────────────────────────────────────────────────────────────────
export const creerPolice = async (req, res) => {
  try {
    const {
      nomAssure, qualite, codeAssure, typePiece, numPieceIdentite,
      adresse, ville, wilaya, profession, activite, telephone, email,
      sexe, age, datePermis,
      marque, typeVehicule, immatriculation, dateMEC, energie, chassis,
      moteur, carrosserie, puissance, tonnage, cylindree, places,
      turbo, avecRemorque, matInflammableVeh, genreVehicule, usage, zone,
      agence, convention, sousConvention, refDossier,
      dateEffet, dateEcheance, duree, fractionnement,
      tarif, type, reduction, regime,
      typeDimension, nombreDimension, exoneration, contratFerme,
      garanties, valeurVenale, valeurANeuf, valeurAutoRadio, capitalAssure,
      majPermis, majAge, majMatieres, primeNette, montantTotal, taxes,
    } = req.body

    if (!nomAssure || !marque || !immatriculation || !dateEffet || !dateEcheance) {
      return res.status(400).json({ message: 'Champs obligatoires manquants.' })
    }

    const agent = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { organizationId: true }
    })
    if (!agent) return res.status(404).json({ message: 'Agent introuvable.' })

    const orgId        = agent.organizationId
    const year         = new Date().getFullYear()
    const rand         = Math.floor(100000 + Math.random() * 900000)
    const numeroPolice = `POL-${year}-${rand}`

    const garantiesStr = garanties
      ? Object.entries(garanties).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(',')
      : 'RC,DR'

    const vehicule = await prisma.vehicule.create({
      data: {
        marque:          marque.toUpperCase(),
        immatriculation: immatriculation.toUpperCase(),
        energie:         energie || 'ESSENCE',
        dateEcheance:    new Date(dateEcheance),
        garanties:       garantiesStr,
        prime:           parseFloat(primeNette) || 0,
        statut:          'ACTIF',
        organizationId:  orgId,
      }
    })

    const police = await prisma.police.create({
      data: {
        numeroPolice, statut: 'EMISE',
        organizationId: orgId, vehiculeId: vehicule.id,
        agence: agence || null, convention: convention || null,
        sousConvention: sousConvention || null, refDossier: refDossier || null,
        dateEffet: new Date(dateEffet), dateEcheance: new Date(dateEcheance),
        duree: parseInt(duree) || 12, fractionnement: fractionnement || 'ANNUEL',
        contratFerme: contratFerme || false,
        tarif: tarif || 'TARIF STANDARD', type: type || 'NOUVELLE AFFAIRE',
        reduction: reduction || 'AUCUNE', regime: regime || 'RÉGIME NORMAL',
        primeNette: parseFloat(primeNette) || 0,
        montantTotal: parseFloat(montantTotal) || 0,
        taxes: parseFloat(taxes) || 0,
        nomAssure, qualite: qualite || 'MONSIEUR',
        codeAssure: codeAssure || null, typePiece: typePiece || 'CNI',
        numPieceIdentite: numPieceIdentite || null,
        adresse: adresse || null, ville: ville || null, wilaya: wilaya || null,
        profession: profession || null, activite: activite || null,
        telephone: telephone || null, email: email || null,
        conducteurNom: nomAssure, conducteurAge: parseInt(age) || null,
        sexe: sexe || null,
        datePermis: datePermis ? new Date(datePermis) : null,
        genreVehicule: genreVehicule || 'VP', usage: usage || 'USAGE PRIVÉ',
        typeDimension: typeDimension || 'Standard',
        nombreDimension: parseInt(nombreDimension) || 1,
        exoneration: exoneration || 'Aucune',
      }
    })

    return res.status(201).json({
      message: 'Police créée avec succès.',
      numeroPolice: police.numeroPolice,
      policeId: police.id,
      vehiculeId: vehicule.id,
    })
  } catch (err) {
    console.error('[CREER POLICE]', err)
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Cette immatriculation existe déjà en base.' })
    }
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/polices/emettre — Agent émet une police depuis une demande client
// ─────────────────────────────────────────────────────────────────────────────
export const emettrePolice = async (req, res) => {
  try {
    const {
      demandeId, numPolice, password, dateEffet, dateEcheance,
      email, nomAssure, dossier
    } = req.body

    if (!numPolice || !dateEffet || !dateEcheance) {
      return res.status(400).json({ message: 'numPolice, dateEffet, dateEcheance obligatoires.' })
    }

    const agent = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { organizationId: true }
    })
    if (!agent) return res.status(404).json({ message: 'Agent introuvable.' })

    const orgId = agent.organizationId

    // 1. Créer le véhicule
    const garantiesStr = dossier?.garanties
      ? Object.entries(dossier.garanties).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(',')
      : 'RC,DR'

    const immat = (dossier?.immatriculation || `IMMAT-${Date.now()}`).toUpperCase()

    const vehicule = await prisma.vehicule.create({
      data: {
        marque:          (dossier?.marque || 'VÉHICULE').toUpperCase(),
        immatriculation: immat,
        energie:         dossier?.energie || 'ESSENCE',
        dateEcheance:    new Date(dateEcheance),
        garanties:       garantiesStr,
        prime:           parseFloat(dossier?.primeNette || dossier?.quittance?.primeNette) || 0,
        statut:          'ACTIF',
        organizationId:  orgId,
      }
    })

    // 2. Créer ou trouver le user client (si email fourni)
    let clientUserId = null
    if (email && password) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (!existingUser) {
        const hash = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
          data: {
            email, password: hash,
            fullName: nomAssure || 'Client SAA',
            role: 'CLIENT',
            organizationId: orgId,
          }
        })
        clientUserId = newUser.id
        // Rattacher le véhicule
        await prisma.vehicule.update({
          where: { id: vehicule.id },
          data: { userId: clientUserId }
        })
      } else {
        clientUserId = existingUser.id
      }
    }

    // 3. Créer la police
    const police = await prisma.police.create({
      data: {
        numeroPolice:    numPolice,
        statut:          'EMISE',
        organizationId:  orgId,
        vehiculeId:      vehicule.id,
        userId:          clientUserId,
        nomAssure:       nomAssure || dossier?.nomAssure || dossier?.nom || 'Client',
        email:           email || dossier?.email || null,
        telephone:       dossier?.telephone || null,
        qualite:         dossier?.qualite || 'MONSIEUR',
        typePiece:       dossier?.typePiece || 'CNI',
        numPieceIdentite: dossier?.numPieceIdentite || null,
        adresse:         dossier?.adresse || null,
        ville:           dossier?.ville || null,
        wilaya:          dossier?.wilaya || null,
        profession:      dossier?.profession || null,
        activite:        dossier?.activite || null,
        conducteurAge:   parseInt(dossier?.age) || null,
        sexe:            dossier?.sexe || null,
        datePermis:      dossier?.datePermis ? new Date(dossier.datePermis) : null,
        genreVehicule:   dossier?.genreVehicule || 'VP',
        usage:           dossier?.usage || 'USAGE PRIVÉ',
        dateEffet:       new Date(dateEffet),
        dateEcheance:    new Date(dateEcheance),
        duree:           parseInt(dossier?.duree) || 12,
        fractionnement:  dossier?.fractionnement || 'ANNUEL',
        primeNette:      parseFloat(dossier?.primeNette || dossier?.quittance?.primeNette) || 0,
        montantTotal:    parseFloat(dossier?.quittance?.totalAPayer) || 0,
        taxes:           parseFloat(dossier?.quittance?.totalTaxes) || 0,
        type:            'NOUVELLE AFFAIRE',
        regime:          dossier?.regime || 'RÉGIME NORMAL',
        reduction:       dossier?.reduction || 'AUCUNE',
        nombreDimension: parseInt(dossier?.nombreDimension) || 1,
      }
    })

    // 4. Mettre à jour le statut de la demande
    if (demandeId) {
      await prisma.demandeCompte.update({
        where: { id: parseInt(demandeId) },
        data: { statut: 'VALIDEE' }   // ← enum Prisma correct
      }).catch(() => {}) // silencieux si demande introuvable
    }

    return res.status(201).json({
      message: 'Police émise avec succès.',
      numeroPolice: police.numeroPolice,
      policeId: police.id,
    })
  } catch (err) {
    console.error('[EMETTRE POLICE]', err)
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Immatriculation ou N° police déjà existant.' })
    }
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/polices/:id/renouveler
// ─────────────────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// Dans polices.controller.js — remplace la fonction renouvelerPolice par celle-ci
// ══════════════════════════════════════════════════════════════════════════════

export const renouvelerPolice = async (req, res) => {
  try {
    const { id } = req.params
    const { modePaiement, montant, duree, garanties } = req.body

    // Vérification
    if (!modePaiement) {
      return res.status(400).json({ message: 'Mode de paiement obligatoire.' })
    }

    // Trouver la police du client connecté
    const police = await prisma.police.findFirst({
      where: {
        id:     parseInt(id),
        userId: req.user.id,
      },
      include: { vehicule: true },
    })

    if (!police) {
      return res.status(404).json({ message: 'Police introuvable.' })
    }

    // Calcul nouvelle échéance
    const dureeChoisie     = parseInt(duree) || police.duree || 12
    const base             = new Date(police.dateEcheance) > new Date()
                               ? new Date(police.dateEcheance)
                               : new Date()
    const nouvelleEcheance = new Date(base)
    nouvelleEcheance.setMonth(nouvelleEcheance.getMonth() + dureeChoisie)

    // Mise à jour de la police → statut PAYEE
    const policeMAJ = await prisma.police.update({
      where: { id: parseInt(id) },
      data: {
        statut:       'PAYEE',           // ← payée après paiement client
        dateEcheance: nouvelleEcheance,
        duree:        dureeChoisie,
        type:         'RENOUVELLEMENT',
      },
    })

    // Mise à jour du véhicule associé (échéance + garanties + prime)
    if (police.vehiculeId) {
      await prisma.vehicule.update({
        where: { id: police.vehiculeId },
        data: {
          statut:       'ACTIF',
          dateEcheance: nouvelleEcheance,
          ...(montant   ? { prime:     parseFloat(montant)   } : {}),
          ...(garanties ? { garanties: garanties              } : {}),
        },
      })
    }

    return res.json({
      message:          'Police payée et renouvelée avec succès.',
      numeroPolice:     policeMAJ.numeroPolice,
      statut:           'PAYEE',
      nouvelleEcheance: nouvelleEcheance.toISOString(),
      duree:            dureeChoisie,
      garanties:        garanties || null,
    })

  } catch (err) {
    console.error('[RENOUVELER POLICE]', err)
    return res.status(500).json({ message: 'Erreur serveur lors du renouvellement.' })
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/polices/demande-nouvelle
// ─────────────────────────────────────────────────────────────────────────────
export const demandeNouvellePolice = async (req, res) => {
  try {
    const userId = req.user.id
    const { marque, immatriculation, dateMEC, energie, puissance, places, chassis, valeurVenale, valeurANeuf, wilaya, usage, message } = req.body

    if (!marque || !immatriculation || !wilaya) {
      return res.status(400).json({ message: 'Marque, immatriculation et wilaya sont obligatoires.' })
    }

    const policeExistante = await prisma.police.findFirst({
      where: { userId }, orderBy: { createdAt: 'desc' },
    })

    const contenuMessage = JSON.stringify({
      type: 'NOUVELLE_POLICE', marque, immatriculation,
      dateMEC: dateMEC || '', energie: energie || 'ESSENCE',
      puissance: puissance || '', places: places || '', chassis: chassis || '',
      valeurVenale: valeurVenale || '', valeurANeuf: valeurANeuf || '',
      usage: usage || 'USAGE PRIVÉ', wilaya, messageClient: message || '',
      nomClient: policeExistante?.nomAssure || '',
      emailClient: policeExistante?.email || '',
      telephoneClient: policeExistante?.telephone || '',
      policeRef: policeExistante?.numeroPolice || '',
    })

    const demande = await prisma.demandeCompte.create({
      data: {
        nom: policeExistante?.nomAssure || 'Client',
        email: policeExistante?.email || '',
        telephone: policeExistante?.telephone || '',
        marque, immatriculation, wilaya,
        message: contenuMessage,
        statut: 'EN_ATTENTE',
      },
    })

    return res.status(201).json({
      message: 'Demande envoyée. Un agent vous contactera.',
      demandeId: demande.id,
    })
  } catch (err) {
    console.error('[DEMANDE NOUVELLE POLICE]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/polices/demandes-nouvelles
// ─────────────────────────────────────────────────────────────────────────────
export const getDemandesNouvelles = async (req, res) => {
  try {
    const demandes = await prisma.demandeCompte.findMany({
      where: { message: { contains: 'NOUVELLE_POLICE' } },
      orderBy: { createdAt: 'desc' },
    })
    const result = demandes.map(d => {
      let infos = {}
      try { infos = JSON.parse(d.message) } catch {}
      return { ...d, infos }
    })
    return res.json(result)
  } catch (err) {
    console.error('[DEMANDES NOUVELLES]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}