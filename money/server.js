// server.js
import dotenv           from 'dotenv';
import express          from 'express';
import path             from 'path';
import cors             from 'cors';
import session          from 'express-session';
import bcrypt           from 'bcryptjs';
import ExcelJS          from 'exceljs';
import { Op }           from 'sequelize';
import AdminJS          from 'adminjs';
import AdminJSExpress   from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';

import { sequelize, Invoice, Transaction, User } from './models/index.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret:            process.env.SESSION_SECRET || 'a very secret key',
  resave:            false,
  saveUninitialized: false,
  cookie:            { secure: false }
}));

// Simple API logger
app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`, {
    params: req.params,
    query:  req.query,
    body:   req.body
  });
  next();
});

// View engine (optional)
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views'));

// ─── ADMINJS SETUP ─────────────────────────────────────────────────────────────
AdminJS.registerAdapter(AdminJSSequelize);
const adminJs = new AdminJS({
  databases: [sequelize],
  rootPath:  '/admin',
  resources: [
    // User resource
    {
      resource: User,
      options: {
        navigation: { name: 'User Management', icon: 'User' },
        properties: {
          id:           { isId: true,   isVisible: { list: true, edit: false, filter: true, show: true } },
          username:     { isVisible: { list: true, edit: true, filter: true, show: true } },
          email:        { isVisible: { list: true, edit: true, filter: true, show: true } },
          passwordHash: { isVisible: false },
          password:     { type: 'string', isVisible: { list: false, edit: true, show: false } }
        },
        actions: {
          new: {
            before: async (request) => {
              console.log('[AdminJS] Creating user:', request.payload);
              if (request.payload.password) {
                const hash = await bcrypt.hash(request.payload.password, 10);
                request.payload = {
                  ...request.payload,
                  passwordHash: hash
                };
                delete request.payload.password;
              }
              return request;
            }
          },
          edit: {
            before: async (request) => {
              console.log('[AdminJS] Editing user:', request.payload);
              if (request.payload.password) {
                const hash = await bcrypt.hash(request.payload.password, 10);
                request.payload = {
                  ...request.payload,
                  passwordHash: hash
                };
                delete request.payload.password;
              }
              return request;
            }
          }
        }
      }
    },
    // Invoice resource
    {
      resource: Invoice,
      options: {
        id:         'Invoices',
        idProperty: 'number',
        properties: {
          number:            { isId: true, isVisible: { list: false, show: true, edit: true, filter: true } },
          displayRowNumber:  { type: 'number', label: 'Number', isVisible: { list: true, show: false, edit: false, filter: false } },
          invoiceNumber:     { isVisible: { list: false, show: true, edit: true, filter: true } },
          type:              { isVisible: { list: true, show: true, edit: true, filter: true } },
          totalAmount:       { isVisible: { list: true, show: true, edit: true, filter: true } },
          totalAmountGerman: { label: 'Total Amount German', isVisible: { list: true, show: true, edit: false, filter: false } },
          date:              { isVisible: { list: true, show: true, edit: true, filter: true } },
          dateGerman:        { label: 'Date German', isVisible: { list: true, show: true, edit: false, filter: false } },
          createdAt:         { label: 'Created At', isVisible: { list: true, show: true, edit: false, filter: false } },
          updatedAt:         { label: 'Updated At', isVisible: { list: true, show: true, edit: false, filter: false } }
        },
        listProperties: [
          'displayRowNumber','updatedAt','createdAt',
          'totalAmountGerman','dateGerman','date','totalAmount','type'
        ],
        actions: {
          list: {
            after: async (response) => {
              console.log('[AdminJS] Listing invoices, meta:', response.meta);
              const { records, meta } = response;
              if (records && meta) {
                const baseIndex = (meta.page - 1) * meta.perPage;
                records.forEach((r, i) => {
                  r.params.displayRowNumber = baseIndex + i + 1;
                });
              }
              return response;
            }
          }
        },
        navigation: null
      }
    },
    // Transaction resource
    {
      resource: Transaction,
      options: {
        id:         'Transactions',
        idProperty: 'id',
        properties: { id: { isId: true } },
        navigation: null
      }
    }
  ],
  branding: {
    companyName:    'Sakai Admin',
    softwareBrothers:false,
    logo:           false
  }
});
app.use(adminJs.options.rootPath, AdminJSExpress.buildRouter(adminJs));

// ─── API ROUTER ────────────────────────────────────────────────────────────────
const api = express.Router();

// POST /api/auth/login
api.post('/auth/login', async (req, res) => {
  console.log('[AUTH] POST /auth/login', req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    console.log('[AUTH] Found user:', user ? user.email : null);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      console.log('[AUTH] Invalid credentials');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    req.session.userId = user.id;
    console.log('[AUTH] Login successful, session.userId =', user.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[AUTH] login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/status
api.get('/auth/status', (req, res) => {
  console.log('[AUTH] GET /auth/status, session.userId =', req.session.userId);
  if (req.session.userId) {
    return res.json({ authenticated: true });
  }
  res.status(401).json({ authenticated: false });
});

// auth-check middleware
function ensureAuth(req, res, next) {
  if (req.session.userId) return next();
  res.status(401).json({ message: 'Not authenticated' });
}

// ─── USER CRUD ─────────────────────────────────────────────────────────────────
api.get('/users', ensureAuth, async (req, res) => {
  console.log('[USERS] GET /users');
  const users = await User.findAll({
    attributes: ['id','username','email','createdAt','updatedAt']
  });
  res.json(users);
});
api.get('/users/:id', ensureAuth, async (req, res) => {
  console.log('[USERS] GET /users/:id', req.params.id);
  const user = await User.findByPk(req.params.id, {
    attributes: ['id','username','email','createdAt','updatedAt']
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});
api.post('/users', ensureAuth, async (req, res) => {
  console.log('[USERS] POST /users', req.body);
  const { username, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, email, passwordHash });
  res.status(201).json({ id: newUser.id, username, email });
});
api.put('/users/:id', ensureAuth, async (req, res) => {
  console.log('[USERS] PUT /users/:id', req.params.id, req.body);
  const { username, email, password } = req.body;
  const updates = { username, email };
  if (password) updates.passwordHash = await bcrypt.hash(password, 10);
  const [count] = await User.update(updates, { where: { id: req.params.id } });
  if (!count) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User updated' });
});
api.delete('/users/:id', ensureAuth, async (req, res) => {
  console.log('[USERS] DELETE /users/:id', req.params.id);
  const deleted = await User.destroy({ where: { id: req.params.id } });
  if (!deleted) return res.status(404).json({ message: 'User not found' });
  res.status(204).end();
});

// ─── INVOICE & EXPORT ──────────────────────────────────────────────────────────
api.get('/invoices', async (req, res) => {
  console.log('[INVOICES] GET /invoices', req.query);
  try {
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.max(1, parseInt(req.query.pageSize) || 10);
    const offset   = (page - 1) * pageSize;
    const where    = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.invoiceNumber) {
      where.invoiceNumber = { [Op.like]: `%${req.query.invoiceNumber}%` };
    }
    const total = await Invoice.count({ where });
    const rows  = await Invoice.findAll({
      where,
      order: [['date','DESC']],
      limit: pageSize,
      offset
    });
    const data = rows.map(inv => ({
      id: inv.number,
      number: inv.number,
      invoiceNumber: inv.invoiceNumber,
      type: inv.type,
      totalAmount: inv.totalAmount,
      date: inv.date.toISOString(),
      vlera: new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(inv.totalAmount),
      dateGerman: new Date(inv.date).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}),
      totalAmountGerman: new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(inv.totalAmount)
    }));
    res.json({ data, page, pageSize, total });
  } catch(err) {
    console.error('[INVOICES] error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices.' });
  }
});

api.get('/invoices/export/excel', async (req, res) => {
  console.log('[INVOICES] GET /invoices/export/excel', req.query);
  try {
    const where = {};
    if (req.query.from || req.query.to) {
      where.date = {};
      if (req.query.from) where.date[Op.gte] = new Date(req.query.from);
      if (req.query.to) {
        const t = new Date(req.query.to);
        t.setHours(23,59,59,999);
        where.date[Op.lte] = t;
      }
    }
    const invoices = await Invoice.findAll({ where, order: [['date','ASC']] });
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Invoices');
    ws.columns = [
      { header:'Seq.', key:'seq', width:6 },
      { header:'DB #', key:'number', width:10 },
      { header:'Invoice Number', key:'invoiceNumber', width:20 },
      { header:'Type', key:'type', width:30 },
      { header:'Amount (€)', key:'totalAmount', width:15 },
      { header:'Date (DE)', key:'dateGerman', width:20 }
    ];
    ws.getRow(1).font = { bold: true };
    invoices.forEach((inv, i) => {
      ws.addRow({
        seq: i+1,
        number: inv.number,
        invoiceNumber: inv.invoiceNumber,
        type: inv.type,
        totalAmount: inv.totalAmount,
        dateGerman: new Date(inv.date).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
      });
    });
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition','attachment; filename="invoices.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  } catch(err) {
    console.error('[INVOICES] export error:', err);
    res.status(500).json({ error: 'Failed to export Excel.' });
  }
});

// ─── TRANSACTIONS ──────────────────────────────────────────────────────────────
api.get('/transactions', async (req, res) => {
  console.log('[TRANSACTIONS] GET /transactions');
  try {
    const transactions = await Transaction.findAll({ order: [['date','DESC']] });
    res.json({ data: transactions });
  } catch(err) {
    console.error('[TRANSACTIONS] error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

api.post('/transactions', async (req, res) => {
  console.log('[TRANSACTIONS] POST /transactions', req.body);
  try {
    const { type, amount, date, description, invoiceId } = req.body;
    const dateOnly = typeof date === 'string' ? date.substring(0,10) : null;
    const tx = await Transaction.create({ type, amount, date: dateOnly, description, invoiceId });
    res.status(201).json(tx);
  } catch(err) {
    console.error('[TRANSACTIONS] create error:', err);
    res.status(500).json({ error: 'Failed to create transaction.' });
  }
});

api.put('/transactions/:id', async (req, res) => {
  console.log('[TRANSACTIONS] PUT /transactions/:id', req.params.id, req.body);
  try {
    const { type, amount, date, description, invoiceId } = req.body;
    const dateOnly = typeof date==='string'?date.substring(0,10):null;
    const [count] = await Transaction.update(
      { type, amount, date: dateOnly, description, invoiceId },
      { where:{ id: req.params.id } }
    );
    if(!count) return res.status(404).json({ error:'Not found' });
    const updated = await Transaction.findByPk(req.params.id);
    res.json(updated);
  } catch(err) {
    console.error('[TRANSACTIONS] update error:', err);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
});

api.delete('/transactions/:id', async (req, res) => {
  console.log('[TRANSACTIONS] DELETE /transactions/:id', req.params.id);
  try {
    const deleted = await Transaction.destroy({ where:{ id: req.params.id } });
    if(!deleted) return res.status(404).json({ error:'Not found' });
    res.status(204).end();
  } catch(err) {
    console.error('[TRANSACTIONS] delete error:', err);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

// Mount API
app.use('/api', api);

// Sync & start, seed admin from ENV
sequelize.sync().then(async () => {
  const pwd = process.env.ADMIN_PASSWORD || 'password123';
  const [admin, created] = await User.findOrCreate({
    where: { email:'admin@example.com' },
    defaults:{
      username:'admin',
      email:'admin@example.com',
      passwordHash: await bcrypt.hash(pwd,10)
    }
  });
  console.log(`${created?'[DB] Created':'[DB] Found'} admin: ${admin.email}`);
  console.log(`[DB] Admin password: ${pwd}`);

  app.listen(PORT,()=>{
    console.log(`⚡️ AdminJS: http://localhost:${PORT}/admin`);
    console.log(`⚡️ API    : http://localhost:${PORT}/api`);
  });
}).catch(err=>{
  console.error('[DB] start error:', err);
});
