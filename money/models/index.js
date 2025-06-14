// models/index.js
const { Sequelize, DataTypes } = require('sequelize');

// Use SQLite: storage = where the .sqlite file will live
const sequelize = new Sequelize({
  dialect:  'sqlite',
  storage:  './database.sqlite',
  logging:  false,             // turn off SQL logging if you like
});

// Import models
const Invoice     = require('./Invoice.js')(sequelize, DataTypes);
const Transaction = require('./Transaction.js')(sequelize, DataTypes);

// Associations
Invoice.hasMany(Transaction,   { foreignKey: 'invoiceId' });
Transaction.belongsTo(Invoice, { foreignKey: 'invoiceId' });

// Export for server.js
module.exports = { sequelize, Invoice, Transaction };
