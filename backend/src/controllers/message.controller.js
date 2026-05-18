import prisma from '../prisma.js'

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/messages/ma-conversation
// Obtenir ou créer la conversation du client connecté
// ─────────────────────────────────────────────────────────────────────────────
export const getMyConversation = async (req, res) => {
  try {
    const userId = req.user.id

    // Récupérer l'organizationId du user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true }
    })
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })

    let conv = await prisma.conversation.findFirst({
      where: { userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    })

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          userId,
          organizationId: user.organizationId, // ← FIX
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      })
    }

    // Marquer les messages agent comme lus
    await prisma.message.updateMany({
      where: { conversationId: conv.id, expediteur: 'agent', lu: false },
      data: { lu: true }
    })

    return res.json(conv)
  } catch (err) {
    console.error('[MA CONVERSATION]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/messages/envoyer
// Envoyer un message (client ou agent)
// ─────────────────────────────────────────────────────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, contenu, expediteur } = req.body

    if (!conversationId || !contenu) {
      return res.status(400).json({ message: 'conversationId et contenu sont obligatoires.' })
    }

    const message = await prisma.message.create({
      data: {
        conversationId: parseInt(conversationId),
        contenu,
        expediteur: expediteur || 'client',
        userId: req.user.id,
      }
    })

    // Mettre à jour updatedAt de la conversation
    await prisma.conversation.update({
      where: { id: parseInt(conversationId) },
      data: { updatedAt: new Date() }
    })

    return res.status(201).json(message)
  } catch (err) {
    console.error('[SEND MESSAGE]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/messages/toutes
// Toutes les conversations (pour l'agent)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllConversations = async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { updatedAt: 'desc' }
    })
    return res.json(conversations)
  } catch (err) {
    console.error('[ALL CONVERSATIONS]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/messages/:id
// Messages d'une conversation (pour l'agent)
// ─────────────────────────────────────────────────────────────────────────────
export const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params

    const conv = await prisma.conversation.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        messages: { orderBy: { createdAt: 'asc' } }
      }
    })

    if (!conv) return res.status(404).json({ message: 'Conversation introuvable.' })

    // Marquer les messages client comme lus
    await prisma.message.updateMany({
      where: { conversationId: parseInt(id), expediteur: 'client', lu: false },
      data: { lu: true }
    })

    return res.json(conv)
  } catch (err) {
    console.error('[CONVERSATION MESSAGES]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/messages/non-lus/count
// Nombre de messages non lus (pour l'agent)
// ─────────────────────────────────────────────────────────────────────────────
export const getNonLus = async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: { expediteur: 'client', lu: false }
    })
    return res.json({ count })
  } catch (err) {
    console.error('[NON LUS]', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}