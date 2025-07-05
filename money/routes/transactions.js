import { Router } from 'express';
import * as ctrl from '../controllers/transactionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
const router = Router();
router.get('/', verifyToken, ctrl.listTransactions);
router.post('/', verifyToken, ctrl.createTransaction);
router.put('/:id', verifyToken, ctrl.updateTransaction);
router.delete('/:id', verifyToken, ctrl.deleteTransaction);
export default router;
