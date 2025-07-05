// server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import invoiceRoutes from './routes/invoices.js';
import transactionRoutes from './routes/transactions.js';

dotenv.config();

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/transactions', transactionRoutes);

// ─── STARTUP LOGIC ────────────────────────────────────────────────────────────
async function startServer() {
  try {
    // 1) Connect to MongoDB
    await connectDB();

    // 2) Seed admin user & print token
    const adminEmail    = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret     = process.env.JWT_SECRET;

    if (!adminEmail || !adminPassword || !jwtSecret) {
      console.warn('⚠️  ADMIN_EMAIL, ADMIN_PASSWORD or JWT_SECRET missing in .env');
    } else {
      // Import User model here to avoid circular import on top
      const User = (await import('./models/User.js')).default;

      let admin = await User.findOne({ email: adminEmail });
      if (!admin) {
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        admin = await User.create({
          username: 'admin',
          email: adminEmail,
          passwordHash
        });
        console.log(`[Seed] Created admin user: ${adminEmail}`);
      } else {
        console.log(`[Seed] Found existing admin user: ${adminEmail}`);
      }

      // Generate JWT for admin
      const token = jwt.sign(
        { userId: admin._id },
        jwtSecret,
        { expiresIn: '2h' }
      );
      console.log('\n🚀 Admin JWT Token (2h validity):\n');
      console.log(token);
      console.log('\nUse this in Postman as: Authorization: Bearer <token>\n');
    }

    // 3) Finally, start Express server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✅ API running at http://localhost:${PORT}/api`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// ─── LAUNCH ───────────────────────────────────────────────────────────────────
startServer();
