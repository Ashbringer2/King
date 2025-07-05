// routes/invoices.js
import { Router } from 'express';
import {
  listInvoices,
  exportInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoiceController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

// READ
router.get('/', verifyToken, listInvoices);
// EXPORT
router.get('/export/excel', verifyToken, exportInvoices);

// CREATE
router.post('/', verifyToken, createInvoice);

// UPDATE
router.put('/:id', verifyToken, updateInvoice);

// DELETE
router.delete('/:id', verifyToken, deleteInvoice);

export default router;
