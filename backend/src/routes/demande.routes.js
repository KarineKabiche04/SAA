import { Router } from 'express'
import {
  createDemande,
  getAllDemandes,
  updateStatutDemande,
  deleteDemande
} from '../controllers/demande.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

// Public — n'importe qui peut soumettre une demande
router.post('/', createDemande)

// Protégé — agents uniquement
router.get('/',           protect, getAllDemandes)
router.put('/:id/statut', protect, updateStatutDemande)
router.delete('/:id',     protect, deleteDemande)

export default router