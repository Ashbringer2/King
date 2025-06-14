import { DataTypes } from 'sequelize';

const TransactionModel = (sequelize) =>
  sequelize.define('Transaction', {
    type:        { type: DataTypes.ENUM('income','expense','debit','credit'), allowNull: false },
    amount:      { type: DataTypes.DECIMAL(10,2), allowNull: false },
    date:        { type: DataTypes.DATEONLY,  allowNull: false },
    description: { type: DataTypes.STRING },
    invoiceId:   {
      type: DataTypes.INTEGER,
      allowNull: true, // Or false if a transaction must always have an invoice
      references: {
        model: 'Invoices', // This can also be the model name: Invoice
        key: 'number',     // The column name in the Invoices table
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  });

export default TransactionModel;
