import { Router } from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  createKlient,
  listKlientet,
  getKlient,
  updateKlient,
  deleteKlient
} from '../controllers/klientController.js';

const router = Router();

// Public ping to confirm mount
router.get('/_ping', (_req, res) => res.json({ ok: true, scope: 'klientet' }));

// Everything below requires JWT
router.use(verifyToken);

// Explicitly handle `/api/klientet` for listing
router.get('/', (req, res) => {
  console.log('[Router] Handling `/api/klientet` for listing');
  listKlientet(req, res);
});

// Explicitly handle `/api/klientet/:id` for specific klient
router.get('/:id', (req, res) => {
  const { id } = req.params;
  if (!id.match(/^[a-fA-F0-9]{24}$/)) {
    console.error('[Router] Invalid ID format for `/api/klientet/:id`:', id);
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  console.log('[Router] Handling `/api/klientet/:id` for specific klient');
  getKlient(req, res);
});

router.post('/', createKlient);   // POST /api/klientet
router.put('/:id', updateKlient);   // PUT /api/klientet/:id
router.delete('/:id', deleteKlient);   // DELETE /api/klientet/:id

export default router;
