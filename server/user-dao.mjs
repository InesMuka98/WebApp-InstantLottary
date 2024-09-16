/**  NEW **/
import exp from 'constants';
import { db } from './db.mjs';
import crypto from 'crypto';
import { ConstrictedInfoUser } from './drawsModels.mjs';

export const getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve(false); 
      }
      else {
        const user = {id: row.id, username: row.email, name: row.name, points: row.points};
        
        crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve({error: 'User not found!'}); 
      }
      else {
        const user = {id: row.id, username: row.email, name: row.name, points: row.points};
        resolve(user);
      }
    });
  });
};

export const getPoints = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT points FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve({error: 'User not found!'}); 
      }
      else {
        const user = new ConstrictedInfoUser(row.id, row.name, row.points);
        resolve(user);
      }
    });
  });
};

export const updateUserPoints = (userId, newPoints) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET points = ? WHERE id = ?';
    db.run(sql, [newPoints, userId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export const listRankedUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name, points FROM users ORDER BY points DESC LIMIT 3';
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else {
        const rankedUsers = rows.map((u) => new ConstrictedInfoUser(u.id, u.name, u.points));
        console.log('ranked users:',rankedUsers)
        resolve(rankedUsers);
      }
    });
  });
}