import prisma from '../prisma.js'

// POST /api/demandes — créer une demande (public)
export const createDemande = async (req, res) => {
  try {
    const { nom, email, telephone, marque, immatriculation, wilaya, message } = req.body

    if (!nom || !email || !telephone || !marque || !immatriculation || !wilaya) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' })
    }

    const existing = await prisma.demandeCompte.findFirst({
      where: { email, statut: 'EN_ATTENTE' }
    })
    if (existing) {
      return res.status(400).json({ message: 'Une demande est déjà en cours pour cet email.' })
    }

    const demande = await prisma.demandeCompte.create({
      data: {
        nom, email, telephone, marque, immatriculation, wilaya,
        message: message || '',
        statut: 'EN_ATTENTE'   // ← enum Prisma correct
      }
    })

    return res.status(201).json({
      message: 'Demande envoyée avec succès ! Un agent SAA vous contactera bientôt.',
      demande
    })
  } catch (err) {
    console.error('[CREATE DEMANDE]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// GET /api/demandes — toutes les demandes (agent)
export const getAllDemandes = async (req, res) => {
  try {
    const demandes = await prisma.demandeCompte.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return res.json(demandes)
  } catch (err) {
    console.error('[GET DEMANDES]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// PUT /api/demandes/:id/statut — mettre à jour le statut (agent)
export const updateStatutDemande = async (req, res) => {
  try {
    const { id }    = req.params
    const { statut, infosDemandees } = req.body

    // ── Mapper les statuts frontend → enum Prisma ──
    const statutMap = {
      'ÉMISE':          'VALIDEE',
      'REFUSÉE':        'REFUSEE',
      'INFOS REQUISES': 'EN_ATTENTE',  // reste en attente mais on note les infos
      'EN ATTENTE':     'EN_ATTENTE',
      'VALIDEE':        'VALIDEE',
      'REFUSEE':        'REFUSEE',
      'EN_ATTENTE':     'EN_ATTENTE',
    }

    const statutPrisma = statutMap[statut] || 'EN_ATTENTE'

    const updateData = { statut: statutPrisma }

    // Si demande d'infos → on stocke dans message
    if (infosDemandees) {
      const demande = await prisma.demandeCompte.findUnique({ where: { id: parseInt(id) } })
      const ancienMessage = demande?.message || ''
      updateData.message = `${ancienMessage}\n\n[INFOS REQUISES]: ${infosDemandees}`
    }

    const demande = await prisma.demandeCompte.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return res.json(demande)
  } catch (err) {
    console.error('[UPDATE STATUT DEMANDE]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// DELETE /api/demandes/:id
export const deleteDemande = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.demandeCompte.delete({ where: { id: parseInt(id) } })
    return res.json({ message: 'Demande supprimée' })
  } catch (err) {
    console.error('[DELETE DEMANDE]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}