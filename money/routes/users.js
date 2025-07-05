import { Router } from 'express';
import { listUsers } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
const router = Router();
router.get('/', verifyToken, listUsers);
export default router;
