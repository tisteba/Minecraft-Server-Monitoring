const express = require("express");
const { Client } = require("ssh2");
const path = require("path");
const WebSocket = require("ws");
const fs = require('fs');

const app = express();
const PORT = 8080;

const sshConfig = {
  host: 'wilfart.fr',
  port: 2010,
  username: 'anthony',
  privateKey: fs.readFileSync('C:/Users/amgoa/.ssh/id_rsa'),
};

function runSSHCommand(command, callback) {
    const ssh = new Client();
    ssh.on('ready', () => {
        ssh.exec(command, (err, stream) => {
            if (err) return callback(err);
            let result = '';
            stream.on('data', (data) => {
                result += data.toString();
            });
            stream.on('end', () => {
                callback(null, result);
                ssh.end();
            });
        });
    }).connect(sshConfig);
}

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
    const sendStats = async () => {
        runSSHCommand("top -bn1 | grep 'Cpu(s)' && free -m", (error, stdout) => {
            if (!error) ws.send(stdout);
        });
    };

    const intervalId = setInterval(sendStats, 5000);
    
    ws.on("message", (message) => {
        runSSHCommand(message, (error, result) => {
            if (!error) {
                ws.send(result);
            } else {
                ws.send(`Erreur: ${error.message}`);
            }
        });
    });

    ws.on("close", () => clearInterval(intervalId));
});

app.use(express.static(path.join(__dirname, "../Frontend")));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../Frontend/Html/index.html")));

const server = app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));

server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
    });
});
