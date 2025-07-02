import { DataTypes } from 'sequelize';

const TransactionModel = (sequelize) =>
  sequelize.define('Transaction', {
    type:        { type: DataTypes.ENUM('income','expense','debit','credit'), allowNull: false },
    amount:      { type: DataTypes.DECIMAL(10,2), allowNull: false },
    date:        { type: DataTypes.DATEONLY,  allowNull: false },
    description: { type: DataTypes.STRING },
    invoiceId:   {
      type: DataTypes.STRING, // Now free text
      allowNull: true
    },
  });

export default TransactionModel;
