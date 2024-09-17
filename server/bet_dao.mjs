import { Draw, Bet} from './drawsModels.mjs';
// UPDATED
import { db } from './db.mjs';
import { updateUserPoints } from './user-dao.mjs';
import dayjs from 'dayjs';

export const saveBet = (userId, currentDrawId, betNumbers, pointsCost, correctGuesses, pointsWon, betTimestamp) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO bets (user_id, draw_id, bet_numbers, points_spent, correct_guesses, points_won, bet_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const betTimestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        db.run(sql, [userId, currentDrawId, betNumbers.join(','), pointsCost, correctGuesses, pointsWon, betTimestamp], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

export const calculatePointsSpent = (betNumbersLength) => {
    switch(betNumbersLength){
        case 1:
            return 5;
        case 2:
            return 10;
        case 3:
            return 15;
        default:
            throw new Error('Invalid number of bet numbers');
    }
}

export const getBetForDraw = (userId, drawId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM bets WHERE user_id = ? AND draw_id = ?';
        db.get(sql, [userId, drawId], (err, row) => {
            if (err)
                reject(err);
            else if (row){
                const bet = new Bet(row.id, row.user_id, row.draw_id, row.bet_numbers.split(',').map(num => parseInt(num)), row.points_spent, row.correct_guesses, row.points_won, row.bet_timestamp);
                resolve(bet);
            }
            else{
                resolve(null);
            }
        });
    });
}

export const calculatePointsWon = (betNumbersLength, correctGuessesLength, pointsSpent) => {
    let pointsWon = 0;
    pointsWon= 2*pointsSpent*correctGuessesLength/betNumbersLength;
    console.log('Points won:', pointsWon);
    return pointsWon;
}

export const placeBetAndUpdatePoints = async (userId, userPoints, drawId, betNumbers, pointsSpent, correctGuesses, pointsWon, betTimestamp) => {
    return new Promise(async (resolve, reject) => {
        try{
            db.run('BEGIN TRANSACTION');
            const result = await saveBet(userId, drawId, betNumbers, pointsSpent, correctGuesses, pointsWon, betTimestamp);
            const newPoints = userPoints - pointsSpent + pointsWon;
            await updateUserPoints(userId, newPoints);
            db.run('COMMIT');
            resolve(result);
        }
        catch(err){
            db.run('ROLLBACK');
            reject(err);
        }
    });
}