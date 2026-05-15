import prisma from '../prisma.js'

// POST /api/demandes — créer une demande de compte (public)
export const createDemande = async (req, res) => {
  try {
    const { nom, email, telephone, marque, immatriculation, wilaya, message } = req.body

    // Validation basique
    if (!nom || !email || !telephone || !marque || !immatriculation || !wilaya) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' })
    }

    // Vérifier si une demande avec cet email est déjà en attente
    const existing = await prisma.demandeCompte.findFirst({
      where: { email, statut: 'EN ATTENTE' }
    })
    if (existing) {
      return res.status(400).json({ message: 'Une demande est déjà en cours pour cet email. Un agent vous contactera bientôt.' })
    }

    const demande = await prisma.demandeCompte.create({
      data: {
        nom,
        email,
        telephone,
        marque,
        immatriculation,
        wilaya,
        message: message || '',
        statut: 'EN ATTENTE'
      }
    })

    res.status(201).json({ message: 'Demande envoyée avec succès ! Un agent SAA vous contactera dans les plus brefs délais.', demande })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// GET /api/demandes — récupérer toutes les demandes (agent uniquement)
export const getAllDemandes = async (req, res) => {
  try {
    const demandes = await prisma.demandeCompte.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(demandes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// PUT /api/demandes/:id/statut — mettre à jour le statut (agent uniquement)
export const updateStatutDemande = async (req, res) => {
  try {
    const { id } = req.params
    const { statut } = req.body // 'TRAITÉE' | 'REFUSÉE' | 'EN ATTENTE'

    const demande = await prisma.demandeCompte.update({
      where: { id: parseInt(id) },
      data: { statut }
    })
    res.json(demande)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// DELETE /api/demandes/:id — supprimer une demande (agent uniquement)
export const deleteDemande = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.demandeCompte.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Demande supprimée' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}