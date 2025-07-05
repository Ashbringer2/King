// controllers/invoiceController.js
import Invoice from '../models/Invoice.js';
import ExcelJS from 'exceljs';

/**
 * GET /api/invoices
 */
export async function listInvoices(req, res) {
  try {
    const { type, invoiceNumber, page = 1, pageSize = 10 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (invoiceNumber) query.invoiceNumber = new RegExp(invoiceNumber, 'i');

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    const data = invoices.map(inv => ({
      id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      type: inv.type,
      totalAmount: inv.totalAmount,
      date: inv.date,
      dateGerman: new Date(inv.date).toLocaleString('de-DE'),
      totalAmountGerman: new Intl.NumberFormat('de-DE', {
        style: 'currency', currency: 'EUR'
      }).format(inv.totalAmount)
    }));

    res.json({ data, page: Number(page), pageSize: Number(pageSize), total });
  } catch (err) {
    console.error('[Invoice] list error:', err);
    res.status(500).json({ message: 'Failed to list invoices' });
  }
}

/**
 * GET /api/invoices/export/excel
 */
export async function exportInvoices(req, res) {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) {
        const t = new Date(to);
        t.setHours(23, 59, 59, 999);
        query.date.$lte = t;
      }
    }

    const invoices = await Invoice.find(query).sort({ date: 1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Invoices');

    sheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Amount (€)', key: 'totalAmount', width: 15 },
      { header: 'Date (DE)', key: 'dateGerman', width: 25 }
    ];

    invoices.forEach((inv, i) => {
      sheet.addRow({
        no: i + 1,
        invoiceNumber: inv.invoiceNumber,
        type: inv.type,
        totalAmount: inv.totalAmount,
        dateGerman: new Date(inv.date).toLocaleString('de-DE')
      });
    });

    res.setHeader('Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="invoices.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('[Invoice] export error:', err);
    res.status(500).json({ message: 'Failed to export invoices' });
  }
}

/**
 * POST /api/invoices
 */
export async function createInvoice(req, res) {
  try {
    const { invoiceNumber, type, totalAmount, date } = req.body;
    const inv = await Invoice.create({ invoiceNumber, type, totalAmount, date });
    res.status(201).json(inv);
  } catch (err) {
    console.error('[Invoice] create error:', err);
    res.status(500).json({ message: 'Failed to create invoice' });
  }
}

/**
 * PUT /api/invoices/:id
 */
export async function updateInvoice(req, res) {
  try {
    const updates = req.body;
    const inv = await Invoice.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    res.json(inv);
  } catch (err) {
    console.error('[Invoice] update error:', err);
    res.status(500).json({ message: 'Failed to update invoice' });
  }
}

/**
 * DELETE /api/invoices/:id
 */
export async function deleteInvoice(req, res) {
  try {
    const inv = await Invoice.findByIdAndDelete(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    res.status(204).end();
  } catch (err) {
    console.error('[Invoice] delete error:', err);
    res.status(500).json({ message: 'Failed to delete invoice' });
  }
}
