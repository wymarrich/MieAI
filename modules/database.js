// modules/database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./user_interactions.db');

function storeUserNumber(userId, messageBody) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM user_interactions WHERE user_id = ?`, [userId], (err, row) => {
            if (err) return reject(err);

            if (row) {
                db.run(
                    `UPDATE user_interactions SET last_message = ?, timestamp = CURRENT_TIMESTAMP WHERE user_id = ?`,
                    [messageBody, userId],
                    (err) => {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            } else {
                db.run(
                    `INSERT INTO user_interactions (user_id, last_message) VALUES (?, ?)`,
                    [userId, messageBody],
                    (err) => {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            }
        });
    });
}

function checkUserPreviousChat(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM user_interactions WHERE user_id = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            resolve(!!row);
        });
    });
}

module.exports = {
    storeUserNumber,
    checkUserPreviousChat
};