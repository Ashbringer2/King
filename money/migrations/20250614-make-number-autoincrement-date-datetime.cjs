"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the Invoices table from scratch
    await queryInterface.createTable('Invoices', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
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
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the Invoices table
    await queryInterface.dropTable('Invoices');
  }
};
