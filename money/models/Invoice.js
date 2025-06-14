const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
    number:      { type: DataTypes.STRING,    allowNull: false, unique: true },
    date:        { type: DataTypes.DATEONLY,  allowNull: false },
    totalAmount: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
    dateGerman: {
      type: DataTypes.VIRTUAL,
      get() {
        const dateStr = this.getDataValue('date');
        if (!dateStr) return '';
        let dateObj;
        if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const [y, m, d] = dateStr.split('-');
          dateObj = new Date(Number(y), Number(m) - 1, Number(d));
        } else {
          dateObj = new Date(dateStr);
        }
        if (isNaN(dateObj.getTime())) return dateStr;
        const pad = n => n.toString().padStart(2, '0');
        return `${pad(dateObj.getDate())}.${pad(dateObj.getMonth()+1)}.${dateObj.getFullYear()}`;
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
