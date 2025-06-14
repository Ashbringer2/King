import sqlite3 from 'sqlite3';
sqlite3.verbose();

const db = new sqlite3.Database('./database.sqlite');

db.all("SELECT name, sql FROM sqlite_master WHERE type='table'", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    for (const row of rows) {
      console.log(`Table: ${row.name}\nSchema: ${row.sql}\n`);
    }
  }
  db.close();
});