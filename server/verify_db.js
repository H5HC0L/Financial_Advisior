const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'chat.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Connected to chat.db');
});

db.all("SELECT id, role, substring(text, 1, 50) as text_snippet, sentiment FROM messages", [], (err, rows) => {
    if (err) {
        throw err;
    }
    console.log("Messages in DB:");
    console.table(rows);
});
