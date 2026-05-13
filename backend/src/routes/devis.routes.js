import { Router } from 'express'

import { 
  createDevis,
  getMyDevis,
  getAllDevis
} from '../controllers/devis.controller.js'

import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/', protect, createDevis)
router.get('/mes-devis', protect, getMyDevis)
router.get('/all', protect, getAllDevis)

export default router