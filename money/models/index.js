// models/index.js
import { Sequelize, DataTypes } from 'sequelize';
import InvoiceModel from './Invoice.js';
import TransactionModel from './Transaction.js';

const sequelize = new Sequelize({
  dialect:  'sqlite',
  storage:  './database.sqlite',
  logging:  console.log, // Enabled Sequelize logging
});

const Invoice = InvoiceModel(sequelize, DataTypes);
const Transaction = TransactionModel(sequelize, DataTypes);

Invoice.hasMany(Transaction,   { foreignKey: 'invoiceId', onDelete: 'CASCADE' });
Transaction.belongsTo(Invoice, { foreignKey: 'invoiceId', onDelete: 'CASCADE' });

export { sequelize, Invoice, Transaction };
