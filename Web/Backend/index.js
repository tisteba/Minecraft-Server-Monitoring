const express = require("express");
const path = require("path");
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, "../Frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/Html/index.html"));
});

app.get("/startserver", (req, res) => {
    res.send("Start server");
});

app.get("/stopserver", (req, res) => {
    res.send("Stop server");
});

app.listen(PORT, () => console.log("Serveur sur http://localhost:8080"));
