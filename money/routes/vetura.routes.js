// routes/vetura.routes.js
import { Router } from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  createVetura, listVeturat, getVetura, updateVetura, deleteVetura
} from '../controllers/veturaController.js';

const router = Router();

// put fixed paths BEFORE :id so `_ping` doesn't get treated as an id
router.get('/veturat/_ping', (_req, res) => res.json({ ok: true, scope: 'veturat' }));
router.get('/veturat', verifyToken, listVeturat);
router.post('/veturat', verifyToken, createVetura);
router.get('/veturat/:id', verifyToken, getVetura);
router.put('/veturat/:id', verifyToken, updateVetura);
router.delete('/veturat/:id', verifyToken, deleteVetura);

export default router;
