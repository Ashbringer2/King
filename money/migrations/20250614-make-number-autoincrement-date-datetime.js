"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change 'number' to INTEGER, autoIncrement, primaryKey
    await queryInterface.changeColumn('Invoices', 'number', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });
    // Change 'date' to DATETIME
    await queryInterface.changeColumn('Invoices', 'date', {
      type: Sequelize.DATE,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert 'number' to STRING
    await queryInterface.changeColumn('Invoices', 'number', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
    // Revert 'date' to DATEONLY
    await queryInterface.changeColumn('Invoices', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: false
    });
  }
};
