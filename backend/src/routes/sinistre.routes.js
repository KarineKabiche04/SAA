import { Router } from 'express'
import { createSinistre, getMySinistres } from '../controllers/sinistre.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/', protect, createSinistre)
router.get('/mes-sinistres', protect, getMySinistres)

export default router