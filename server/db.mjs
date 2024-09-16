/** NEW **/
import sqlite from 'sqlite3';

// open the database
export const db = new sqlite.Database('lottery.sqlite', (err) => {
  if (err) throw err;
});