import { Invoice, Transaction, sequelize } from './models/index.js'; // Assumes models/index.js exports these correctly

const INVOICE_ID_TO_DELETE = 221225; // Replace with an actual invoice ID from your database

async function testDeleteInvoice(invoiceId) {
  console.log(`Attempting to delete invoice with ID: ${invoiceId}`);
  try {
    // Start a transaction
    const t = await sequelize.transaction();
    console.log('Transaction started.');

    // Find the invoice
    const invoice = await Invoice.findByPk(invoiceId, { transaction: t });

    if (!invoice) {
      console.log(`Invoice with ID ${invoiceId} not found.`);
      await t.rollback(); // Rollback if invoice not found
      console.log('Transaction rolled back.');
      return;
    }

    console.log(`Found invoice: ${JSON.stringify(invoice, null, 2)}`);

    // Manually find and delete associated transactions
    // This step is technically not needed if ON DELETE CASCADE is working,
    // but it's good for debugging to see if transactions are found.
    const transactions = await Transaction.findAll({
      where: { invoiceId: invoice.number }, // Assuming 'number' is the PK of Invoice and FK in Transaction
      transaction: t
    });

    if (transactions.length > 0) {
      console.log(`Found ${transactions.length} associated transactions. Attempting to delete them...`);
      await Transaction.destroy({
        where: { invoiceId: invoice.number },
        transaction: t
      });
      console.log('Associated transactions deleted.');
    } else {
      console.log('No associated transactions found.');
    }

    // Delete the invoice
    console.log('Attempting to delete the invoice itself...');
    await invoice.destroy({ transaction: t });
    console.log(`Invoice with ID ${invoiceId} and its associated transactions should be deleted.`);

    // Commit the transaction
    await t.commit();
    console.log('Transaction committed.');

  } catch (error) {
    console.error('Error during invoice deletion test:', error);
    // If a transaction was started and an error occurred, it might not be automatically rolled back
    // depending on where the error happened. For safety, explicitly check and rollback if 't' exists and is not finished.
    // However, sequelize.transaction() usually handles this.
    // For this script, the primary goal is to see the error.
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

testDeleteInvoice(INVOICE_ID_TO_DELETE);
