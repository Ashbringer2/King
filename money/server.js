// server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { connectDB } from './config/db.js';

// ── EXISTING ROUTES ───────────────────────────────────────────────────────────
import authRoutes        from './routes/auth.js';
import userRoutes        from './routes/users.js';
import invoiceRoutes     from './routes/invoices.js';
import transactionRoutes from './routes/transactions.js';
import typeRoutes        from './routes/types.js';

// ── NEW DOMAIN ROUTES (ensure these files exist with .js extension) ──────────
import veturaRoutes      from './routes/vetura.routes.js';     // defines /veturat inside
import klientRoutes      from './routes/klient.routes.js';     // defines /klientet inside
import komitentRoutes    from './routes/komitent.routes.js';   // defines /komitentet inside

dotenv.config();

// ── INIT APP ─────────────────────────────────────────────────────────────────
const app = express();

// Tiny request logger (no extra deps)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// CORS / JSON
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/_ping', (_req, res) => res.json({ ok: true, scope: 'api' }));

// Optional route dump (for debugging)
app.get('/_routes', (_req, res) => {
  const out = [];
  app._router.stack.forEach(layer => {
    if (layer.route) {
      out.push({
        method: Object.keys(layer.route.methods).join(',').toUpperCase(),
        path: layer.route.path
      });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const base = layer.regexp?.toString() || '';
      layer.handle.stack.forEach(r => {
        if (r.route) {
          out.push({
            method: Object.keys(r.route.methods).join(',').toUpperCase(),
            path: `${base} ${r.route.path}`
          });
        }
      });
    }
  });
  res.json(out);
});

// ── MOUNT ROUTERS (order matters; keep before 404) ───────────────────────────
// Mount auth routes first so public endpoints (login/register) are not
// accidentally intercepted by other routers that apply auth middleware
app.use('/api/auth',         authRoutes);

// Mount domain routers under /api. These routers may apply `verifyToken`
// internally and must come after the auth routes to avoid route collisions.
app.use('/api', veturaRoutes);      // /api/veturat, /api/vetura/:id ...
app.use('/api', klientRoutes);      // /api/klientet, /api/klientet/:id ...
app.use('/api', komitentRoutes);    // /api/komitentet, /api/komitentet/:id ...
app.use('/api/users',        userRoutes);
app.use('/api/invoices',     invoiceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/types',        typeRoutes);

// 404 (keep after mounts)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method });
});

// Error handler (last)
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Server error',
    path: req.originalUrl
  });
});

// ── STARTUP ──────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB();

    // Seed admin + show JWT for Postman
    const { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } = process.env;
    if (ADMIN_EMAIL && ADMIN_PASSWORD && JWT_SECRET) {
      const User = (await import('./models/User.js')).default;

      let admin = await User.findOne({ email: ADMIN_EMAIL });
      if (!admin) {
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        admin = await User.create({ username: 'admin', email: ADMIN_EMAIL, passwordHash });
        console.log(`[Seed] Created admin: ${ADMIN_EMAIL}`);
      } else {
        console.log(`[Seed] Admin exists: ${ADMIN_EMAIL}`);
      }

      const token = jwt.sign({ userId: admin._id }, JWT_SECRET, { expiresIn: '2h' });
      console.log('\nAdmin JWT (2h):\n' + token + '\nUse as Authorization: Bearer <token>\n');
    } else {
      console.warn('ADMIN_EMAIL / ADMIN_PASSWORD / JWT_SECRET missing; skipping seed.');
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}/api`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
