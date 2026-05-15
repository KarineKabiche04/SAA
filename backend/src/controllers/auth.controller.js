import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'

export const register = async (req, res) => {
  try {
    const { email, password, fullName, numPolice } = req.body
    
    // Vérifier si le N° de police existe dans la table Vehicule
    if (numPolice) {
      const police = await prisma.vehicule.findFirst({
        where: { id: parseInt(numPolice) }
      })
      if (!police) {
        return res.status(400).json({ 
          message: 'Police introuvable. Vérifiez votre N° ou contactez votre agence SAA.' 
        })
      }
    }

    const existe = await prisma.user.findUnique({ where: { email } })
    if (existe) return res.status(400).json({ message: 'Email déjà utilisé' })
    
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ 
      data: { email, password: hash, fullName } 
    })
    res.status(201).json({ message: 'Compte créé avec succès' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect' })
    const valide = await bcrypt.compare(password, user.password)
    if (!valide) return res.status(400).json({ message: 'Email ou mot de passe incorrect' })
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}