// server.js
import express from 'express';
import path from 'path';
import cors from 'cors';
import ExcelJS from 'exceljs';
import { Op } from 'sequelize';
import { sequelize, Invoice, Transaction } from './models/index.js';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine (if still needed)
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views'));

// --- AdminJS Setup ---
AdminJS.registerAdapter(AdminJSSequelize);
const adminJs = new AdminJS({
  databases: [sequelize],
  rootPath: '/admin',
  resources: [
    {
      resource: Invoice,
      options: {
        id: 'Invoices',
        idProperty: 'number',
        properties: {
          number: { isId: true, isVisible: { list: false, show: true, edit: true, filter: true } },
          displayRowNumber: { type: 'number', label: 'Number', isVisible: { list: true, show: false, edit: false, filter: false } },
          invoiceNumber: { isVisible: { list: false, show: true, edit: true, filter: true } },
          type: { isVisible: { list: true, show: true, edit: true, filter: true } },
          totalAmount: { isVisible: { list: true, show: true, edit: true, filter: true } },
          totalAmountGerman: { label: 'Total Amount German', isVisible: { list: true, show: true, edit: false, filter: false } },
          date: { isVisible: { list: true, show: true, edit: true, filter: true } },
          dateGerman: { label: 'Date German', isVisible: { list: true, show: true, edit: false, filter: false } },
          createdAt: { label: 'Created At', isVisible: { list: true, show: true, edit: false, filter: false } },
          updatedAt: { label: 'Updated At', isVisible: { list: true, show: true, edit: false, filter: false } }
        },
        listProperties: [
          'displayRowNumber', 'updatedAt', 'createdAt',
          'totalAmountGerman', 'dateGerman', 'date', 'totalAmount', 'type'
        ],
        actions: {
          list: {
            after: async (response) => {
              const { records, meta } = response;
              if (records && meta) {
                const baseIndex = (meta.page - 1) * meta.perPage;
                records.forEach((r, i) => r.params.displayRowNumber = baseIndex + i + 1);
              }
              return response;
            }
          }
        },
        navigation: null
      }
    },
    {
      resource: Transaction,
      options: {
        id: 'Transactions',
        idProperty: 'id',
        properties: { id: { isId: true } },
        navigation: null
      }
    }
  ],
  branding: {
    companyName: 'Sakai Admin',
    softwareBrothers: false,
    logo: false
  }
});
app.use(adminJs.options.rootPath, AdminJSExpress.buildRouter(adminJs));
// --- End AdminJS Setup ---

const api = express.Router();

/**  
 * GET /api/invoices  
 * Supports:  
 *   - pagination via `?page=1&pageSize=10`  
 *   - filtering via `?type=...&invoiceNumber=...`  
 */
api.get('/invoices', async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)     || 1);
    const pageSize = Math.max(1, parseInt(req.query.pageSize) || 10);
    const offset   = (page - 1) * pageSize;

    // Build where clause
    const where = {};
    if (req.query.type) {
      where.type = req.query.type;
    }
    if (req.query.invoiceNumber) {
      where.invoiceNumber = { [Op.like]: `%${req.query.invoiceNumber}%` };
    }

    // Query total count
    const total = await Invoice.count({ where });
    // Query page of rows
    const rows  = await Invoice.findAll({
      where,
      order: [['date', 'DESC']],
      limit: pageSize,
      offset
    });

    // Format German fields
    const data = rows.map(inv => ({
      id:            inv.number,
      number:        inv.number,
      invoiceNumber: inv.invoiceNumber,
      type:          inv.type,
      totalAmount:   inv.totalAmount,
      date:          inv.date.toISOString(),
      vlera:         new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(inv.totalAmount),
      dateGerman:    new Date(inv.date).toLocaleString('de-DE', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }),
      totalAmountGerman: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(inv.totalAmount)
    }));

    res.json({ data, page, pageSize, total });
  } catch (err) {
    console.error('GET /api/invoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices.' });
  }
});

/**  
 * GET /api/invoices/export/excel  
 * Optionally filter by date range: ?from=2025-06-24T00:00:00Z&to=2025-07-24T23:59:59Z  
 */
api.get('/invoices/export/excel', async (req, res) => {
  try {
    const where = {};
    if (req.query.from || req.query.to) {
      where.date = {};
      if (req.query.from) {
        where.date[Op.gte] = new Date(req.query.from);
      }
      if (req.query.to) {
        const t = new Date(req.query.to);
        t.setHours(23, 59, 59, 999);
        where.date[Op.lte] = t;
      }
    }

    const invoices = await Invoice.findAll({
      where,
      order: [['date', 'ASC']]
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Invoices');
    ws.columns = [
      { header: 'Seq.', key: 'seq', width: 6 },
      { header: 'DB #', key: 'number', width: 10 },
      { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
      { header: 'Type', key: 'type', width: 30 },
      { header: 'Amount (€)', key: 'totalAmount', width: 15 },
      { header: 'Date (DE)', key: 'dateGerman', width: 20 }
    ];
    ws.getRow(1).font = { bold: true };

    invoices.forEach((inv, i) => {
      ws.addRow({
        seq:          i + 1,
        number:       inv.number,
        invoiceNumber:inv.invoiceNumber,
        type:         inv.type,
        totalAmount:  inv.totalAmount,
        dateGerman:   new Date(inv.date).toLocaleString('de-DE', {
                         day: '2-digit', month: '2-digit', year: 'numeric',
                         hour: '2-digit', minute: '2-digit'
                       })
      });
    });

    res.setHeader('Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="invoices.xlsx"');

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('EXPORT EXCEL error:', err);
    res.status(500).json({ error: 'Failed to export Excel.' });
  }
});

/**
 * GET /api/transactions
 * Returns all transactions
 */
api.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ order: [['date', 'DESC']] });
    res.json({ data: transactions });
  } catch (err) {
    console.error('GET /api/transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

/**
 * POST /api/transactions
 * Creates a new transaction
 */
api.post('/transactions', async (req, res) => {
  try {
    const { type, amount, date, description, invoiceId } = req.body;
    // Ensure date is in YYYY-MM-DD format for DATEONLY
    const dateOnly = date ? (typeof date === 'string' ? date.substring(0, 10) : null) : null;
    const tx = await Transaction.create({ type, amount, date: dateOnly, description, invoiceId });
    res.status(201).json(tx);
  } catch (err) {
    console.error('POST /api/transactions error:', err);
    res.status(500).json({ error: err.message || 'Failed to create transaction.' });
  }
});

/**
 * DELETE /api/transactions/:id
 * Deletes a transaction by id
 */
api.delete('/transactions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Transaction.destroy({ where: { id } });
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Transaction not found.' });
    }
  } catch (err) {
    console.error('DELETE /api/transactions/:id error:', err);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

// Mount the API
app.use('/api', api);

// Sync & start
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('⚡️ AdminJS: http://localhost:3000/admin');
    console.log('⚡️ API     : http://localhost:3000/api/invoices');
  });
}).catch(err => {
  console.error('Server start error:', err);
});
