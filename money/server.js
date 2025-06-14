// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');

(async () => {
  try {
    const modelsNS = await import('./models/index.js');
    const { sequelize, Invoice, Transaction } = modelsNS.default;

    const app = express();
    app.use(cors()); // Enable CORS for all routes and methods
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Set EJS as the view engine
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Admin panel: List invoices
    app.get('/admin/invoices', async (req, res) => {
      const invoices = await Invoice.findAll();
      res.render('invoices-list', { invoices });
    });

    // Admin panel: Edit invoice form
    app.get('/admin/invoices/edit/:id', async (req, res) => {
      const invoice = await Invoice.findByPk(req.params.id);
      res.render('invoices-edit', { invoice });
    });

    // Admin panel: Update invoice
    app.post('/admin/invoices/edit/:id', async (req, res) => {
      const { number, date, totalAmount } = req.body;
      await Invoice.update({ number, date, totalAmount }, { where: { id: req.params.id } });
      res.redirect('/admin/invoices');
    });

    // Admin panel: Delete invoice
    app.post('/admin/invoices/delete/:id', async (req, res) => {
      await Invoice.destroy({ where: { id: req.params.id } });
      res.redirect('/admin/invoices');
    });

    // Admin panel: Create invoice form
    app.get('/admin/invoices/create', (req, res) => {
      res.render('invoices-create');
    });

    // Admin panel: Create invoice
    app.post('/admin/invoices/create', async (req, res) => {
      const { number, date, totalAmount } = req.body;
      await Invoice.create({ number, date, totalAmount });
      res.redirect('/admin/invoices');
    });

    // API routes (keep for frontend)
    const apiRouter = express.Router();

    // GET /api/invoices - list all invoices
    apiRouter.get('/invoices', async (req, res) => {
      try {
        // Support pagination and filtering
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        const where = {};
        if (req.query.type) where.type = req.query.type;
        if (req.query.invoiceNumber) where.invoiceNumber = req.query.invoiceNumber;
        const { count, rows: all } = await Invoice.findAndCountAll({ where, offset, limit: pageSize, order: [['date', 'DESC']] });
        // Format date as dd.mm.yyyy hh:mm
        const formatted = all.map(inv => {
          let dateObj = new Date(inv.date);
          const pad = n => n.toString().padStart(2, '0');
          let formattedDate = '';
          if (!isNaN(dateObj.getTime())) {
            formattedDate = `${pad(dateObj.getDate())}.${pad(dateObj.getMonth()+1)}.${dateObj.getFullYear()} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
          }
          return {
            ...inv.toJSON(),
            date: formattedDate
          };
        });
        res.json({ total: count, data: formatted });
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
      }
    });

    // POST /api/invoices - create a new invoice
    apiRouter.post('/invoices', async (req, res) => {
      try {
        let { invoiceNumber, type, totalAmount } = req.body;
        if (!invoiceNumber || !type || totalAmount === undefined || totalAmount === null || totalAmount === '') {
          return res.status(400).json({ error: 'invoiceNumber, type, and totalAmount are required.' });
        }
        // Save with current datetime
        const now = new Date();
        const inv = await Invoice.create({ invoiceNumber, type, totalAmount, date: now });
        res.status(201).json(inv);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    // PUT /api/invoices/:id - update an invoice
    apiRouter.put('/invoices/:id', async (req, res) => {
      try {
        const id = req.params.id;
        console.log(`[PUT /api/invoices/${id}] Update request body:`, req.body);
        const invoice = await Invoice.findByPk(id);
        if (!invoice) {
          console.warn(`[PUT /api/invoices/${id}] Invoice not found.`);
          return res.status(404).json({ error: 'Invoice not found.' });
        }
        let { number, date, totalAmount } = req.body;
        if (number !== undefined) invoice.number = number;
        if (date !== undefined) {
          let dateObj = new Date(date);
          if (!isNaN(dateObj.getTime())) {
            invoice.date = dateObj.toISOString().slice(0, 10);
          } else {
            invoice.date = null;
          }
        }
        if (totalAmount !== undefined) {
          let total = Number(totalAmount);
          if (!isNaN(total)) {
            invoice.totalAmount = total;
          } else {
            invoice.totalAmount = 0;
          }
        }
        await invoice.save();
        console.log(`[PUT /api/invoices/${id}] Updated invoice:`, invoice.toJSON());
        res.json(invoice);
      } catch (err) {
        console.error(`[PUT /api/invoices/:id] Error:`, err);
        res.status(400).json({ error: err.message });
      }
    });

    // DELETE /api/invoices/:id - delete an invoice
    apiRouter.delete('/invoices/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleted = await Invoice.destroy({ where: { id } });
        if (deleted) {
          res.json({ success: true });
        } else {
          res.status(404).json({ error: 'Invoice not found.' });
        }
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    // BULK POST /api/invoices/bulk - create multiple invoices at once
    apiRouter.post('/invoices/bulk', async (req, res) => {
      try {
        const { invoices } = req.body;
        if (!Array.isArray(invoices) || invoices.length === 0) {
          return res.status(400).json({ error: 'No invoices provided.' });
        }
        const created = [];
        for (const row of invoices) {
          const { invoiceNumber, type, value } = row;
          if (!invoiceNumber || !type || value === undefined || value === null || value === '') {
            continue; // skip invalid rows
          }
          const now = new Date();
          const inv = await Invoice.create({ invoiceNumber, type, totalAmount: value, date: now });
          created.push(inv);
        }
        res.status(201).json({ created: created.length });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    // TODO: add more routes for Transaction, etc.
    app.use('/api', apiRouter);

    // Sync database and start server
    await sequelize.sync();
    app.listen(3000, () => {
      console.log('⚡️ Admin panel ready: http://localhost:3000/admin/invoices');
      console.log('⚡️ API ready: http://localhost:3000/api/invoices');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
})();
