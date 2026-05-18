import express                    from 'express';
import { getAllUsers, createAgent } from '../controllers/users.controller.js';

const router = express.Router();

router.get('/all',           getAllUsers);   // GET  /api/users/all
router.post('/create-agent', createAgent);  // POST /api/users/create-agent

export default router;