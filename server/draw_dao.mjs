import { Draw} from './drawsModels.mjs';
// UPDATED
import { db } from './db.mjs';
import dayjs from 'dayjs';

export const getCurrentDraw = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT draws.* FROM draws ORDER BY draw_timestamp DESC LIMIT 1';
      db.get(sql, [], (err, row) => {
        if (err)
          reject(err);
        else if (row){
          const draw = new Draw(row.id, row.draw_numbers, row.draw_timestamp);
          resolve(draw);
        }
        else{
            resolve(null);
        }
      });
    });
  }

  export const getLastCompletedDraw = () => {
    return new Promise((resolve, reject) => {
      const adjustedTimestamp = dayjs().subtract(2, 'minute').format('YYYY-MM-DD HH:mm:ss');
      const sql = 'SELECT * FROM draws WHERE draw_timestamp < ? ORDER BY draw_timestamp DESC LIMIT 1';
      db.get(sql, [adjustedTimestamp], (err, row) => {
        if (err)
          reject(err);
        else if (row){
          const draw = new Draw(row.id, row.draw_numbers, row.draw_timestamp);
          resolve(draw);
        }
        else{
            resolve(null);
        }
      });
    });
  }

// Generate 5 random distinct numbers between 1 and 90
export const generateDrawNumbers = () => {
  let numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 90) + 1);
  }
  return [...numbers];
};

// Save the generated draw numbers to the database
export const saveDrawToDatabase = async (numbers) => {
  const drawNumbers = numbers.join(',');
  const drawTimestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');  // Use the current timestamp
  await db.run('INSERT INTO draws (draw_numbers, draw_timestamp) VALUES (?, ?)', [drawNumbers, drawTimestamp]);
};

// Generate and store a new draw
export const generateAndStoreDraw = async () => {
  const numbers = generateDrawNumbers();
  await saveDrawToDatabase(numbers);
  return numbers;
};
