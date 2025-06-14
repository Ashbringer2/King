
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Backup existing data
      console.log('Backing up existing Transactions data...');
      const existingTransactions = await queryInterface.sequelize.query(
        'SELECT * FROM `Transactions`;',
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );
      console.log(`Found ${existingTransactions.length} transactions to backup.`);

      // 2. Drop the old Transactions table
      console.log('Dropping existing Transactions table...');
      await queryInterface.dropTable('Transactions', { transaction });
      console.log('Transactions table dropped.');

      // 3. Recreate the Transactions table with the correct schema
      console.log('Recreating Transactions table with correct schema and foreign key...');
      await queryInterface.createTable('Transactions', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        type: {
          type: Sequelize.ENUM('income', 'expense', 'debit', 'credit'), // Match your model
          allowNull: false
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        description: {
          type: Sequelize.STRING
        },
        invoiceId: {
          type: Sequelize.INTEGER,
          allowNull: true, // Or false if it's mandatory
          references: {
            model: 'Invoices', // Name of the target table
            key: 'number',     // Name of the target column in Invoices table
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE', // Crucial for auto-deleting transactions
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });
      console.log('Transactions table recreated.');

      // 4. Restore data (if any)
      if (existingTransactions.length > 0) {
        console.log('Restoring backed-up data...');
        await queryInterface.bulkInsert('Transactions', existingTransactions, { transaction });
        console.log('Data restored.');
      } else {
        console.log('No data to restore.');
      }

      await transaction.commit();
      console.log('Migration completed successfully.');

    } catch (err) {
      await transaction.rollback();
      console.error('Migration failed:', err);
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('Reverting: Backing up current Transactions data (if any)...');
      const currentTransactions = await queryInterface.sequelize.query(
        'SELECT * FROM `Transactions`;',
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      await queryInterface.dropTable('Transactions', { transaction });
      console.log('Reverting: Transactions table dropped.');

      console.log('Reverting: Recreating Transactions table with potentially incorrect old schema...');
      await queryInterface.createTable('Transactions', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        type: { type: Sequelize.TEXT, allowNull: false }, 
        amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        date: { type: Sequelize.DATE, allowNull: false }, 
        description: { type: Sequelize.STRING },
        invoiceId: {
          type: Sequelize.INTEGER,
          references: { model: 'Invoices', key: 'id' }, 
          onDelete: 'SET NULL', 
          onUpdate: 'CASCADE'   
        },
        createdAt: { allowNull: false, type: Sequelize.DATE },
        updatedAt: { allowNull: false, type: Sequelize.DATE }
      }, { transaction });
      console.log('Reverting: Transactions table recreated with old schema attempt.');

      if (currentTransactions.length > 0) {
        console.log('Reverting: Restoring data to old schema table...');
        await queryInterface.bulkInsert('Transactions', currentTransactions, { transaction });
        console.log('Reverting: Data restored.');
      }

      await transaction.commit();
      console.log('Reversion migration completed.');
    } catch (err) {
      await transaction.rollback();
      console.error('Reversion migration failed:', err);
      throw err;
    }
  }
};
