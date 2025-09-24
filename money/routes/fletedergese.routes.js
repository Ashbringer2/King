import { Router } from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  listByPranim, createFletedergese, deleteFletedergese, makeFatureFromFletedergese
} from '../controllers/fletedergeseController.js';

const r = Router();
r.get('/pranimet/:id/fletedergesa', verifyToken, listByPranim);
r.post('/fletedergesa',             verifyToken, createFletedergese);
r.delete('/fletedergesa/:id',       verifyToken, deleteFletedergese);
r.post('/fletedergesa/:id/fatura',  verifyToken, makeFatureFromFletedergese);
export default r;
