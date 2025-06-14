import sqlite3 from 'sqlite3';
sqlite3.verbose();

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // 1. Create new table with ON DELETE CASCADE
  db.run(`CREATE TABLE IF NOT EXISTS Transactions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255),
    invoiceId INTEGER REFERENCES Invoices(number) ON DELETE CASCADE ON UPDATE CASCADE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
  )`, (err) => {
    if (err) return console.error('Create table error:', err);
    // 2. Copy data
    db.run(`INSERT INTO Transactions_new (id, type, amount, date, description, invoiceId, createdAt, updatedAt)
      SELECT id, type, amount, date, description, invoiceId, createdAt, updatedAt FROM Transactions`, (err) => {
      if (err) return console.error('Copy data error:', err);
      // 3. Drop old table
      db.run('DROP TABLE Transactions', (err) => {
        if (err) return console.error('Drop old table error:', err);
        // 4. Rename new table
        db.run('ALTER TABLE Transactions_new RENAME TO Transactions', (err) => {
          if (err) return console.error('Rename table error:', err);
          console.log('Migration complete: Transactions table now uses ON DELETE CASCADE.');
          db.close();
        });
      });
    });
  });
});