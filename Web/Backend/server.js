const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Client } = require("ssh2");
const os = require("os-utils");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");


const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("../Frontend"));
app.use(fileUpload());

const sshConfig = {
    host: "wilfart.fr",
    port: 2010,
    username: "anthony",
    privateKey: fs.readFileSync("C:/Users/amgoa/.ssh/id_rsa"),
};

let ssh = new Client();
let sshStream;


app.use(express.static(path.join(__dirname, "../Frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/Html/presentation.html"));
});

app.get("/monitoring", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/Html/index.html"));
});


// Connexion SSH & Terminal interactif
io.on("connection", (socket) => {
    console.log("Nouvelle connexion WebSocket");

    ssh.on("ready", () => {
        console.log("Connexion SSH établie");
        ssh.shell((err, stream) => {
            if (err) throw err;
            sshStream = stream;
            stream.on("data", (data) => socket.emit("terminalOutput", data.toString()));
        });
    });

    ssh.connect(sshConfig);

    socket.on("terminalInput", (command) => {
        if (sshStream) sshStream.write(command + "\n");
    });

    socket.on("serverControl", (action) => {
        let cmd = action === "start" ? "systemctl start minecraft" :
                  action === "stop" ? "systemctl stop minecraft" :
                  "systemctl restart minecraft";
        ssh.exec(cmd, (err, stream) => {
            if (err) console.error(err);
            stream.on("close", () => socket.emit("serverMessage", `Serveur ${action}`));
        });
    });

    setInterval(() => {
        os.cpuUsage((v) => socket.emit("cpuUsage", v * 100));
        socket.emit("ramUsage", (1 - os.freememPercentage()) * 100);
    }, 2000);

    socket.on("disconnect", () => {
        console.log("Déconnexion");
        if (sshStream) sshStream.end();
        ssh.end();
    });
});

// Gestion des fichiers
app.post("/upload", (req, res) => {
    if (!req.files) return res.status(400).send("Aucun fichier");
    let file = req.files.file;
    file.mv(`../Minecraft-Server-Monitoring/${file.name}`, (err) => {
        if (err) return res.status(500).send(err);
        res.send("Fichier envoyé");
    });
});

server.listen(8080, () => console.log("Serveur lancé sur http://localhost:8080"));
