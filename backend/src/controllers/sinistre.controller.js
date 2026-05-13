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
export const getAllSinistres = async (req, res) => {
  try {
    const sinistres = await prisma.sinistre.findMany({
      include: { user: { select: { email: true, fullName: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(sinistres)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}
export const updateSinistre = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, montant, motifRefus, piecesDemandees, commentaire } = req.body;
    const updated = await prisma.sinistre.update({
      where: { id: parseInt(id) },
      data: {
        statut,
        montant: parseFloat(montant) || 0,
        contenu: JSON.stringify({ motifRefus, piecesDemandees, commentaire })
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
