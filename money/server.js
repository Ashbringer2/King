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
        console.log('[GET /api/invoices] Fetching all invoices...');
        const all = await Invoice.findAll();
        console.log(`[GET /api/invoices] Found ${all.length} invoices.`);
        // Format date and totalAmount for German display
        const formatted = all.map((inv, idx) => {
          // --- Date formatting ---
          let dateStr = inv.date;
          let formattedDate = '';
          if (dateStr) {
            // Accept both YYYY-MM-DD and Date objects
            let dateObj;
            if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              const [y, m, d] = dateStr.split('-');
              dateObj = new Date(Number(y), Number(m) - 1, Number(d));
            } else {
              dateObj = new Date(dateStr);
            }
            if (!isNaN(dateObj.getTime())) {
              const pad = n => n.toString().padStart(2, '0');
              formattedDate = `${pad(dateObj.getDate())}.${pad(dateObj.getMonth()+1)}.${dateObj.getFullYear()}`;
            } else {
              formattedDate = dateStr;
            }
          }
          // --- Total formatting ---
          let totalRaw = inv.totalAmount;
          let totalNum = Number(totalRaw);
          let formattedTotal = '';
          if (!isNaN(totalNum)) {
            formattedTotal = `${totalNum.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
          }
          // Log each invoice transformation
          console.log(`[GET /api/invoices] Invoice #${idx+1}: number=${inv.number}, date=${dateStr} => ${formattedDate}, totalAmount=${totalRaw} => ${formattedTotal}`);
          return {
            ...inv.toJSON(),
            date: dateStr, // ISO for input
            dateGerman: formattedDate, // for display
            totalAmount: formattedTotal
          };
        });
        res.json(formatted);
      } catch (err) {
        console.error('[GET /api/invoices] Error:', err);
        res.status(500).json({ error: 'Failed to fetch invoices' });
      }
    });

    // POST /api/invoices - create a new invoice
    apiRouter.post('/invoices', async (req, res) => {
      try {
        console.log('[POST /api/invoices] Creating invoice with body:', req.body);
        let { number, date, totalAmount } = req.body;
        if (!number || !date || totalAmount === undefined || totalAmount === null || totalAmount === '') {
          console.warn('[POST /api/invoices] Missing required fields.');
          return res.status(400).json({ error: 'number, date, and totalAmount are required.' });
        }
        let dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          console.warn('[POST /api/invoices] Invalid date format:', date);
          return res.status(400).json({ error: 'Invalid date format.' });
        }
        // Store date as YYYY-MM-DD
        const formattedDate = dateObj.toISOString().slice(0, 10);
        const total = Number(totalAmount);
        if (isNaN(total)) {
          console.warn('[POST /api/invoices] Invalid totalAmount:', totalAmount);
          return res.status(400).json({ error: 'totalAmount must be a valid number.' });
        }
        const inv = await Invoice.create({ number, date: formattedDate, totalAmount: total });
        console.log('[POST /api/invoices] Created invoice:', inv.toJSON());
        res.status(201).json(inv);
      } catch (err) {
        console.error('[POST /api/invoices] Error:', err);
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
