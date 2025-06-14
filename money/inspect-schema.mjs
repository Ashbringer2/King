import { sequelize } from './models/index.js';

async function inspectSchema() {
  try {
    console.log('Fetching schema for Invoices table...');
    const [invoiceSchemaResult] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='Invoices';");
    if (invoiceSchemaResult && invoiceSchemaResult.length > 0 && invoiceSchemaResult[0]) {
      console.log('Invoices Table Schema:', invoiceSchemaResult[0].sql);
    } else {
      console.log('Invoices table not found or no schema information available.');
      console.log('Raw Invoices schema result:', invoiceSchemaResult);
    }

    console.log('\nFetching schema for Transactions table...');
    const [transactionSchemaResult] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='Transactions';");
    if (transactionSchemaResult && transactionSchemaResult.length > 0 && transactionSchemaResult[0]) {
      console.log('Transactions Table Schema:', transactionSchemaResult[0].sql);
    } else {
      console.log('Transactions table not found or no schema information available.');
      console.log('Raw Transactions schema result:', transactionSchemaResult);
    }

    console.log('\nFetching foreign key list for Transactions table...');
    const [fkListResult] = await sequelize.query("PRAGMA foreign_key_list('Transactions');");
    if (fkListResult && fkListResult.length > 0) {
      console.log('Transactions Foreign Key List:');
      console.table(fkListResult);
    } else {
      console.log('No foreign keys found for Transactions table or PRAGMA foreign_key_list returned no results.');
      console.log('Raw foreign_key_list result:', fkListResult);
    }

    console.log('\nFetching PRAGMA table_info for Invoices table...');
    const [invoiceTableInfo] = await sequelize.query("PRAGMA table_info('Invoices');");
    if (invoiceTableInfo && invoiceTableInfo.length > 0) {
        console.log('Invoices Table Info:');
        console.table(invoiceTableInfo);
    } else {
        console.log('No table info found for Invoices table.');
        console.log('Raw Invoices table_info result:', invoiceTableInfo);
    }

    console.log('\nFetching PRAGMA table_info for Transactions table...');
    const [transactionTableInfo] = await sequelize.query("PRAGMA table_info('Transactions');");
    if (transactionTableInfo && transactionTableInfo.length > 0) {
        console.log('Transactions Table Info:');
        console.table(transactionTableInfo);
    } else {
        console.log('No table info found for Transactions table.');
        console.log('Raw Transactions table_info result:', transactionTableInfo);
    }

  } catch (error) {
    console.error('Error inspecting schema:', error);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
}

inspectSchema();
