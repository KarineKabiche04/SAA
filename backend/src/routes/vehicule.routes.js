import { Router } from 'express'
import { getMyVehicules, createVehicule, renouvelerVehicule, changerVehicule, getAllVehicules } from '../controllers/vehicule.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/mes-vehicules',   protect, getMyVehicules)
router.get('/all',             protect, getAllVehicules)
router.post('/',               protect, createVehicule)
router.put('/:id/renouveler', protect, renouvelerVehicule)
router.put('/:id/changer',    protect, changerVehicule)

export default router