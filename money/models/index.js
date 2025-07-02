// models/index.js
import { Sequelize, DataTypes } from 'sequelize';
import InvoiceModel      from './Invoice.js';
import TransactionModel  from './Transaction.js';
import UserModel         from './User.js';        // ← new import

const sequelize = new Sequelize({
  dialect:  'sqlite',
  storage:  './database.sqlite',
  logging:  console.log, // you can turn this off in prod
});

const Invoice     = InvoiceModel(sequelize, DataTypes);
const Transaction = TransactionModel(sequelize, DataTypes);
const User        = UserModel(sequelize);         // ← initialize User

// preserve your existing relations
Invoice.hasMany(Transaction,   { foreignKey: 'invoiceId', onDelete: 'CASCADE' });
Transaction.belongsTo(Invoice, { foreignKey: 'invoiceId', onDelete: 'CASCADE' });

export {
  sequelize,
  Invoice,
  Transaction,
  User     // ← export it for server.js/AdminJS
};
