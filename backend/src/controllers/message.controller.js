import prisma from '../prisma.js'

// Obtenir ou créer la conversation du client connecté
export const getMyConversation = async (req, res) => {
  try {
    const userId = req.user.id
    let conv = await prisma.conversation.findFirst({
      where: { userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    })
    if (!conv) {
      conv = await prisma.conversation.create({
        data: { userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      })
    }
    // Marquer les messages agent comme lus
    await prisma.message.updateMany({
      where: { conversationId: conv.id, expediteur: 'agent', lu: false },
      data: { lu: true }
    })
    res.json(conv)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// Envoyer un message (client ou agent)
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, contenu, expediteur } = req.body
    const message = await prisma.message.create({
      data: { conversationId: parseInt(conversationId), contenu, expediteur: expediteur || 'client' }
    })
    res.status(201).json(message)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// Toutes les conversations (pour l'agent)
export const getAllConversations = async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { updatedAt: 'desc' }
    })
    res.json(conversations)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// Messages d'une conversation (pour l'agent)
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
    if (!conv) return res.status(404).json({ message: 'Conversation introuvable' })
    // Marquer les messages client comme lus
    await prisma.message.updateMany({
      where: { conversationId: parseInt(id), expediteur: 'client', lu: false },
      data: { lu: true }
    })
    res.json(conv)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// Nombre de messages non lus pour l'agent
export const getNonLus = async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: { expediteur: 'client', lu: false }
    })
    res.json({ count })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}