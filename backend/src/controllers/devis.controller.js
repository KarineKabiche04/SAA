import prisma from '../prisma.js'

export const createDevis = async (req, res) => {
  try {
    const { contenu } = req.body
    const userId = req.user.id
    const devis = await prisma.devis.create({
      data: { userId, contenu: JSON.stringify(contenu), statut: 'en attente' }
    })
    res.status(201).json(devis)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const getMyDevis = async (req, res) => {
  try {
    const devis = await prisma.devis.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    })
    res.json(devis)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}
export const getAllDevis = async (req, res) => {
  try {
    const devis = await prisma.devis.findMany({
      include: { user: { select: { email: true, fullName: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(devis)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}
