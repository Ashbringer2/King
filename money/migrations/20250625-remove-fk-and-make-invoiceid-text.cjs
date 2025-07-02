// Migration to remove the foreign key constraint on invoiceId and change its type to TEXT in Transactions table

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Rename the old table
    await queryInterface.renameTable('Transactions', 'Transactions_old');

    // 2. Recreate the Transactions table without FK and with invoiceId as TEXT
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING
      },
      invoiceId: {
        type: Sequelize.TEXT, // Now TEXT, no FK
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 3. Copy data from old table to new table, converting invoiceId to TEXT
    await queryInterface.sequelize.query(`
      INSERT INTO Transactions (id, type, amount, date, description, invoiceId, createdAt, updatedAt)
      SELECT id, type, amount, date, description, invoiceId, createdAt, updatedAt FROM Transactions_old;
    `);

    // 4. Drop the old table
    await queryInterface.dropTable('Transactions_old');
  },

  down: async (queryInterface, Sequelize) => {
    // Not implemented: would require recreating the FK and converting invoiceId back to INTEGER
    throw new Error('Down migration not supported.');
  }
};
