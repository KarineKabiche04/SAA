import prisma from '../prisma.js'

export const getMyVehicules = async (req, res) => {
  try {
    const vehicules = await prisma.vehicule.findMany({
      where: { userId: req.user.id },
      orderBy: { dateEcheance: 'asc' }
    })
    res.json(vehicules)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const createVehicule = async (req, res) => {
  try {
    const { marque, immatriculation, energie, dateEcheance, garanties, prime } = req.body
    const vehicule = await prisma.vehicule.create({
      data: {
        userId: req.user.id,
        marque,
        immatriculation,
        energie: energie || 'ESSENCE',
        dateEcheance: new Date(dateEcheance),
        garanties: garanties || 'RC,DR',
        prime: parseFloat(prime) || 0,
        statut: 'ACTIF'
      }
    })
    res.status(201).json(vehicule)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const renouvelerVehicule = async (req, res) => {
  try {
    const { id } = req.params
    const { dateEcheance, prime } = req.body
    const vehicule = await prisma.vehicule.findFirst({
      where: { id: parseInt(id), userId: req.user.id }
    })
    if (!vehicule) return res.status(404).json({ message: 'Véhicule non trouvé' })
    const updated = await prisma.vehicule.update({
      where: { id: parseInt(id) },
      data: {
        dateEcheance: new Date(dateEcheance),
        prime: parseFloat(prime) || vehicule.prime,
        statut: 'ACTIF'
      }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }

}
export const changerVehicule = async (req, res) => {
  try {
    const { id } = req.params
    const { marque, immatriculation, energie } = req.body
    const vehicule = await prisma.vehicule.findFirst({
      where: { id: parseInt(id), userId: req.user.id }
    })
    if (!vehicule) return res.status(404).json({ message: 'Véhicule non trouvé' })
    const updated = await prisma.vehicule.update({
      where: { id: parseInt(id) },
      data: {
        marque: marque || vehicule.marque,
        immatriculation: immatriculation || vehicule.immatriculation,
        energie: energie || vehicule.energie,
        statut: 'AVENANT EN COURS'
      }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const getAllVehicules = async (req, res) => {
  try {
    const vehicules = await prisma.vehicule.findMany({
      include: { user: { select: { email: true, fullName: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(vehicules)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}