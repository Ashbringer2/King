"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Invoices');

    if (!tableInfo.invoiceNumber) {
      await queryInterface.addColumn('Invoices', 'invoiceNumber', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      });
    }

    if (!tableInfo.type) {
      await queryInterface.addColumn('Invoices', 'type', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Invoices');

    if (tableInfo.invoiceNumber) {
      await queryInterface.removeColumn('Invoices', 'invoiceNumber');
    }

    if (tableInfo.type) {
      await queryInterface.removeColumn('Invoices', 'type');
    }
  }
};
