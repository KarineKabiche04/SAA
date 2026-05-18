import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER — Client existant SAA (avec N° de police)
// ─────────────────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { email, password, fullName, numPolice } = req.body

    // 1. Validation des champs obligatoires
    if (!email || !password || !fullName || !numPolice) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' })
    }

    // 2. Chercher la police par son numéro
    const police = await prisma.police.findUnique({
      where: { numeroPolice: numPolice },
      include: { vehicule: true }
    })

    if (!police) {
      return res.status(400).json({
        message: 'N° de police introuvable. Vérifiez votre attestation ou contactez votre agence SAA.'
      })
    }

    // 3. Vérifier que cette police n'est pas déjà rattachée à un compte
    if (police.userId) {
      return res.status(400).json({
        message: 'Un compte existe déjà pour cette police. Connectez-vous ou contactez votre agence.'
      })
    }

    // 4. Vérifier que l'email n'est pas déjà utilisé
    const emailExiste = await prisma.user.findUnique({ where: { email } })
    if (emailExiste) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' })
    }

    // 5. Créer le compte client
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        fullName,
        role: 'CLIENT',
        organizationId: police.organizationId, // hérite de l'org de la police
      }
    })

    // 6. Rattacher la police au nouveau client
    await prisma.police.update({
      where: { id: police.id },
      data: { userId: user.id }
    })

    // 7. Rattacher le véhicule aussi si userId est encore null
    if (police.vehicule && !police.vehicule.userId) {
      await prisma.vehicule.update({
        where: { id: police.vehicule.id },
        data: { userId: user.id }
      })
    }

    return res.status(201).json({ message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' })

  } catch (err) {
    console.error('[REGISTER ERROR]', err)
    return res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe obligatoires.' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' })
    }

    const valide = await bcrypt.compare(password, user.password)
    if (!valide) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, organizationId: user.organizationId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
      }
    })

  } catch (err) {
    console.error('[LOGIN ERROR]', err)
    return res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer.' })
  }
}