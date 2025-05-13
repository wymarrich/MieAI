const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./user_interactions.db');

// Create the table if it does not exist
db.run(`
    CREATE TABLE IF NOT EXISTS user_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        last_message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`, (err) => {
    if (err) {
        console.error("Error creating table:", err.message);
    } else {
        console.log("Table 'user_interactions' is ready.");
    }
});