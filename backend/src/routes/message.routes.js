import { Router } from 'express'
import {
  getMyConversation,
  sendMessage,
  getAllConversations,
  getConversationMessages,
  getNonLus
} from '../controllers/message.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/ma-conversation',     protect, getMyConversation)
router.post('/envoyer',            protect, sendMessage)
router.get('/toutes',              protect, getAllConversations)
router.get('/:id',                 protect, getConversationMessages)
router.get('/non-lus/count',       protect, getNonLus)

export default router