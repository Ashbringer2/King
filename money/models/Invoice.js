import { DataTypes } from 'sequelize';

const InvoiceModel = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
    number:      { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('number');
      }
    },
    invoiceNumber: { type: DataTypes.STRING, allowNull: false },
    type:        { type: DataTypes.STRING,    allowNull: false },
    totalAmount: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
    date:        { type: DataTypes.DATE,  allowNull: false },
    dateGerman: {
      type: DataTypes.VIRTUAL,
      get() {
        const dateVal = this.getDataValue('date');
        if (!dateVal) return '';
        const dateObj = new Date(dateVal);
        if (isNaN(dateObj.getTime())) return dateVal;
        const pad = n => n.toString().padStart(2, '0');
        return `${pad(dateObj.getDate())}.${pad(dateObj.getMonth()+1)}.${dateObj.getFullYear()} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
      }
    },
    totalAmountGerman: {
      type: DataTypes.VIRTUAL,
      get() {
        const total = this.getDataValue('totalAmount');
        if (total == null || isNaN(Number(total))) return '';
        return `${Number(total).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
      }
    }
  });
  return Invoice;
};

export default InvoiceModel;
