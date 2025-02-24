const express = require('express');
const db = require('./config/database');
const app = express();
const port = 3000;

app.use(express.json());

// Route pour récupérer tous les utilisateurs
app.get('/utilisateurs', (req, res) => {
  db.all('SELECT * FROM utilisateurs', [], (err, rows) => {
    if (err) {
        return res.status(500).send('Erreur lors de la récupération des utilisateurs');
    }
    res.json(rows);
});
});

// Route pour ajouter un utilisateur
app.post('/utilisateurs', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO utilisateurs (name) VALUES (?)', [name], function(err) {
    if (err) {
        return res.status(500).send('Erreur lors de l\'ajout de l\'utilisateur');
    }
    res.status(201).json({ id: this.lastID, name });
});
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
