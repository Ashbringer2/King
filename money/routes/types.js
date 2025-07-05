// routes/types.js
import { Router } from 'express';
import {
  listTypes,
  createType,
  updateType,
  deleteType
} from '../controllers/transactionTypeController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/',    verifyToken, listTypes);
router.post('/',   verifyToken, createType);
router.put('/:id', verifyToken, updateType);
router.delete('/:id', verifyToken, deleteType);

export default router;
