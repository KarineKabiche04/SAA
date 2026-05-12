import { Router } from 'express'
import { createDevis, getMyDevis } from '../controllers/devis.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/', protect, createDevis)
router.get('/mes-devis', protect, getMyDevis)

export default router