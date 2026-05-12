import prisma from '../prisma.js'

export const createSinistre = async (req, res) => {
  try {
    const { contenu } = req.body
    const userId = req.user.id
    const year = new Date().getFullYear()
    const ref = `SIN-${year}-${Math.floor(Math.random() * 9000 + 1000)}`
    const sinistre = await prisma.sinistre.create({
      data: {
        userId,
        ref,
        type: contenu.circDesc?.trim() || 'Accident',
        lieu: contenu.lieu || '',
        statut: 'EN COURS',
        montant: 0,
        contenu: JSON.stringify(contenu)
      }
    })
    res.status(201).json(sinistre)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const getMySinistres = async (req, res) => {
  try {
    const sinistres = await prisma.sinistre.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    })
    res.json(sinistres)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}