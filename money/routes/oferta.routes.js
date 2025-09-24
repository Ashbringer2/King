import { Router } from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  listByPranim, createOferta, deleteOferta, makeFletedergeseFromOferta
} from '../controllers/ofertaController.js';

const r = Router();
r.get('/pranimet/:id/ofertat', verifyToken, listByPranim);
r.post('/ofertat',             verifyToken, createOferta);
r.delete('/ofertat/:id',       verifyToken, deleteOferta);
r.post('/ofertat/:id/fletedergese', verifyToken, makeFletedergeseFromOferta);
export default r;
