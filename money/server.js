// server.js
import express from 'express';
import path from 'path';
import cors from 'cors';
import { sequelize, Invoice, Transaction } from './models/index.js';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';

const app = express();
app.use(cors()); // Enable CORS for all routes and methods
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine (if you still need it for other routes)
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
          number: { isId: true },
        },
        navigation: null,
      }
    },
    {
      resource: Transaction,
      options: {
        id: 'Transactions',
        idProperty: 'id',
        properties: {
          id: {isId: true}
        },
        navigation: null,
      }
    }
  ],
  branding: {
    companyName: 'Sakai Admin',
    softwareBrothers: false,
    logo: false
  }
});
const adminRouter = AdminJSExpress.buildRouter(adminJs);
app.use(adminJs.options.rootPath, adminRouter);
// --- End AdminJS Setup ---

    // // Admin panel: List invoices
    // app.get('/admin/invoices', async (req, res) => {
    //   const invoices = await Invoice.findAll();
    //   res.render('invoices-list', { invoices });
    // });
    // // Admin panel: Edit invoice form
    // app.get('/admin/invoices/edit/:id', async (req, res) => {
    //   const invoice = await Invoice.findByPk(req.params.id);
    //   res.render('invoices-edit', { invoice });
    // });
    // // Admin panel: Update invoice
    // app.post('/admin/invoices/edit/:id', async (req, res) => {
    //   const { number, date, totalAmount, invoiceNumber, type } = req.body;
    //   await Invoice.update({ number, date, totalAmount, invoiceNumber, type }, { where: { id: req.params.id } });
    //   res.redirect('/admin/invoices');
    // });
    // // Admin panel: Delete invoice
    // app.post('/admin/invoices/delete/:id', async (req, res) => {
    //   try {
    //     console.log(`Received ID parameter: ${req.params.id}`);
    //     if (!req.params.id) {
    //       console.error('ID parameter is missing or undefined.');
    //       return res.status(400).send('ID parameter is required.');
    //     }
    //     const result = await Invoice.destroy({ where: { number: req.params.id } });
    //     console.log(`Result of delete operation:`, result);
    //     res.redirect('/admin/invoices');
    //   } catch (error) {
    //     console.error(`Error deleting invoice with ID ${req.params.id}:`, error);
    //     res.status(400).send('Error deleting invoice');
    //   }
    // });
    // // Admin panel: Create invoice form
    // app.get('/admin/invoices/create', (req, res) => {
    //   res.render('invoices-create');
    // });
    // // Admin panel: Create invoice
    // app.post('/admin/invoices/create', async (req, res) => {
    //   const { number, date, totalAmount, invoiceNumber, type } = req.body;
    //   await Invoice.create({ number, date, totalAmount, invoiceNumber, type });
    //   res.redirect('/admin/invoices');
    // });

    // API routes (keep for frontend)
    const apiRouter = express.Router();

    // GET /api/invoices - list all invoices
    apiRouter.get('/invoices', async (req, res) => {
      try {
        const invoices = await Invoice.findAll();
        const formattedInvoices = invoices.map(inv => ({
          number: inv.number,
          invoiceNumber: inv.invoiceNumber,
          type: inv.type,
          vlera: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(inv.totalAmount),
          date: new Date(inv.date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        }));
        res.status(200).send({ data: formattedInvoices });
      } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).send({ error: 'Internal server error.' });
      }
    });

    // POST /api/invoices - create a new invoice
    apiRouter.post('/invoices', async (req, res) => {
      try {
        let { invoiceNumber, type, totalAmount } = req.body;
        if (!invoiceNumber || !type) {
          console.error('Validation failed: invoiceNumber and type are required.');
          return res.status(400).send('Invoice Number and Type are required.');
        }
        if (totalAmount === undefined || totalAmount === null || totalAmount === '') {
          return res.status(400).json({ error: 'totalAmount is required.' });
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
      const { id } = req.params;
      const invoiceNumber = Number(id);
      console.log(`Received DELETE request for invoice number: ${invoiceNumber}`);

      try {
        // Check if invoice exists
        const invoice = await Invoice.findOne({ where: { number: invoiceNumber } });
        if (!invoice) {
          console.log(`Invoice with number ${invoiceNumber} not found.`);
          return res.status(404).send({ error: 'Invoice not found.' });
        }
        // Manually delete related transactions before deleting the invoice
        await Transaction.destroy({ where: { invoiceId: invoiceNumber } });
        const deleted = await Invoice.destroy({ where: { number: invoiceNumber } });
        if (deleted) {
          console.log(`Invoice with number ${invoiceNumber} deleted successfully.`);
          res.status(200).send({ message: 'Invoice deleted successfully.' });
        } else {
          res.status(500).send({ error: 'Failed to delete invoice.' });
        }
      } catch (err) {
        console.error(`[DELETE /api/invoices/:id] Error:`, err);
        res.status(500).send({ error: 'An unexpected error occurred while deleting the invoice.' });
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
    sequelize.sync().then(() => {
      app.listen(3000, () => {
        console.log('⚡️ AdminJS ready: http://localhost:3000/admin');
        console.log('⚡️ API ready: http://localhost:3000/api/invoices');
      });
    }).catch((err) => {
      console.error('❌ Failed to start server:', err);
    });
