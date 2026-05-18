import { Router } from 'express'
import {
  mesPolices,
  getAllPolices,
  creerPolice,
  emettrePolice,
  renouvelerPolice,
  demandeNouvellePolice,
  getDemandesNouvelles,
} from '../controllers/polices.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

// ── CLIENT ────────────────────────────────────────────────────────────────────
router.get('/mes-polices',        protect, mesPolices)
router.post('/:id/renouveler',    protect, renouvelerPolice)
router.post('/demande-nouvelle',  protect, demandeNouvellePolice)

// ── AGENT / ADMIN ─────────────────────────────────────────────────────────────
router.get('/all',                protect, getAllPolices)
router.get('/demandes-nouvelles', protect, getDemandesNouvelles)
router.post('/creer',             protect, creerPolice)
router.post('/emettre',           protect, emettrePolice)   // ← NOUVEAU

export default router