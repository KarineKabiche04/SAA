import { Router } from 'express'
import { 
  createSinistre,
  getMySinistres,
  updateSinistre,
  getAllSinistres
} from '../controllers/sinistre.controller.js'

import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/', protect, createSinistre)
router.get('/mes-sinistres', protect, getMySinistres)
router.get('/all', protect, getAllSinistres)
router.put('/:id', protect, updateSinistre)

export default router