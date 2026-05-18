import prisma from '../prisma.js'

// ─── POST /api/sinistres ──────────────────────────────────────────────────────
export const createSinistre = async (req, res) => {
  try {
    const { contenu } = req.body
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { organizationId: true },
    })
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })

    const year = new Date().getFullYear()
    const ref  = `SIN-${year}-${Math.floor(Math.random() * 9000 + 1000)}`

    const sinistre = await prisma.sinistre.create({
      data: {
        userId,
        organizationId: user.organizationId,
        ref,
        type:    contenu?.circDesc?.trim() || 'Accident',
        lieu:    contenu?.lieu             || '',
        statut:  'EN_COURS',
        montant: 0,
        contenu: JSON.stringify(contenu),   // ← tout le constat sauvegardé
      },
    })

    return res.status(201).json(sinistre)
  } catch (err) {
    console.error('[CREATE SINISTRE]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ─── GET /api/sinistres/mes-sinistres ─────────────────────────────────────────
export const getMySinistres = async (req, res) => {
  try {
    const sinistres = await prisma.sinistre.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(sinistres)
  } catch (err) {
    console.error('[GET MY SINISTRES]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ─── GET /api/sinistres/all ───────────────────────────────────────────────────
export const getAllSinistres = async (req, res) => {
  try {
    const sinistres = await prisma.sinistre.findMany({
      include: {
        user: { select: { email: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(sinistres)
  } catch (err) {
    console.error('[GET ALL SINISTRES]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ─── PUT /api/sinistres/:id ───────────────────────────────────────────────────
export const updateSinistre = async (req, res) => {
  try {
    const { id } = req.params
    const { statut, montant, motifRefus, piecesDemandees, commentaire } = req.body

    // Mapping frontend → enum Prisma
    const statutMap = {
      'VALIDÉ':   'TRAITE',
      'REFUSÉ':   'REFUSE',
      'EN COURS': 'EN_COURS',
      'TRAITE':   'TRAITE',
      'REFUSE':   'REFUSE',
      'EN_COURS': 'EN_COURS',
    }
    const statutPrisma = statutMap[statut] || 'EN_COURS'

    // ⚠️ FIX CRITIQUE : récupérer le contenu existant AVANT de mettre à jour
    // pour ne pas écraser le constat original du client
    const sinistreExistant = await prisma.sinistre.findUnique({
      where: { id: parseInt(id) },
    })

    let contenuparsed = {}
    try {
      contenuparsed = JSON.parse(sinistreExistant?.contenu || '{}')
    } catch { contenuparsed = {} }

    // Fusionner : garder le constat original + ajouter la décision agent
    const contenuFinal = {
      ...contenuparsed,            // ← tout le constat du client (date, lieu, vehiculeA/B, etc.)
      decision: {                  // ← décision agent ajoutée
        statut:          statutPrisma,
        montant:         parseFloat(montant) || 0,
        motifRefus:      motifRefus      || '',
        piecesDemandees: piecesDemandees || '',
        commentaire:     commentaire     || '',
        traiteLe:        new Date().toISOString(),
      },
    }

    const updated = await prisma.sinistre.update({
      where: { id: parseInt(id) },
      data: {
        statut:  statutPrisma,
        montant: parseFloat(montant) || 0,
        contenu: JSON.stringify(contenuFinal),  // ← constat + décision fusionnés
      },
    })

    return res.json(updated)
  } catch (err) {
    console.error('[UPDATE SINISTRE]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}