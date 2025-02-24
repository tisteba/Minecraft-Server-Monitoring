const sqlite3 = require('sqlite3').verbose();

// Crée la base de données (un fichier .db) si elle n'existe pas
const db = new sqlite3.Database('./alternos.db', (err) => {
    if (err) {
    console.error('Erreur de connexion à SQLite:', err.message);
    } else {
    console.log('Base de données SQLite connectée');
}
});

// Créer la table "utilisateurs" si elle n'existe pas
db.run(`
    CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);
`);

module.exports = db;
