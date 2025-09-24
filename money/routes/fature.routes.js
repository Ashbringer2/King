import { Router } from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { listByPranim, createFature, deleteFature } from '../controllers/fatureController.js';

const r = Router();
r.get('/pranimet/:id/faturat', verifyToken, listByPranim);
r.post('/faturat',             verifyToken, createFature);
r.delete('/faturat/:id',       verifyToken, deleteFature);
export default r;
