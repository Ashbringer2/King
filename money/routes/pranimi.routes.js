import { Router } from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  getPranimiById, createPranimi, updatePranimi,
  closePranimi, openPranimi, listPrintedByPranim
} from '../controllers/pranimiController.js';

const r = Router();
r.get('/pranimet/:id', verifyToken, getPranimiById);
r.post('/pranimet',    verifyToken, createPranimi);
r.put('/pranimet/:id', verifyToken, updatePranimi);
r.post('/pranimet/:id/close', verifyToken, closePranimi);
r.post('/pranimet/:id/open',  verifyToken, openPranimi);
r.get('/pranimet/:id/prints', verifyToken, listPrintedByPranim);
export default r;
