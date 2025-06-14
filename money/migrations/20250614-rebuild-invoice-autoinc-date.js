"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create new table with correct schema
    await queryInterface.createTable('Invoices_temp', {
      number: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      invoiceNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    // 2. Copy data from old table (convert date to datetime if needed)
    await queryInterface.sequelize.query(`
      INSERT INTO Invoices_temp (number, invoiceNumber, type, totalAmount, date, createdAt, updatedAt)
      SELECT number, invoiceNumber, type, totalAmount, 
        CASE 
          WHEN length(date) = 10 THEN date || ' 00:00:00' 
          ELSE date 
        END, 
        COALESCE(createdAt, CURRENT_TIMESTAMP), COALESCE(updatedAt, CURRENT_TIMESTAMP)
      FROM Invoices
    `);
    // 3. Drop old table
    await queryInterface.dropTable('Invoices');
    // 4. Rename new table
    await queryInterface.renameTable('Invoices_temp', 'Invoices');
  },

  down: async (queryInterface, Sequelize) => {
    // Not implemented: would require reverse migration
    throw new Error('Down migration not implemented.');
  }
};
