const express = require("express");
const { Client } = require("ssh2");
const path = require("path");
const WebSocket = require("ws");
const fs = require("fs");

const app = express();
const PORT = 8080;

// Configuration SSH
const sshConfig = {
  host: "wilfart.fr",
  port: 2010,
  username: "anthony",
  privateKey: fs.readFileSync("C:/Users/amgoa/.ssh/id_rsa"),
};

// Fonction pour exécuter des commandes SSH
function runSSHCommand(command, callback) {
  const ssh = new Client();
  ssh.on("ready", () => {
    ssh.exec(command, (err, stream) => {
      if (err) return callback(err);
      let result = "";
      stream.on("data", (data) => {
        result += data.toString();
      });
      stream.on("end", () => {
        callback(null, result);
        ssh.end();
      });
    });
  }).connect(sshConfig);
}

// WebSocket pour la console SSH
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  // Envoyer les données de la console SSH en temps réel
  const sendConsoleOutput = (output) => {
    ws.send(JSON.stringify({ type: "console", data: output }));
  };

  // Envoyer les statistiques du serveur (CPU, température, RAM)
  const sendServerStats = async () => {
    runSSHCommand("top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'", (error, cpu) => {
      if (error) return sendConsoleOutput(`Erreur CPU: ${error.message}`);

      // Commande pour récupérer la température (plus générique)
      runSSHCommand("sensors | grep 'Core 0' | awk '{print $3}' | sed 's/+/ /g'", (error, temp) => {
        if (error) return sendConsoleOutput(`Erreur Température: ${error.message}`);

        runSSHCommand("free | grep Mem | awk '{print $3/$2 * 100.0}'", (error, ram) => {
          if (error) return sendConsoleOutput(`Erreur RAM: ${error.message}`);

          const stats = {
            cpu: parseFloat(cpu).toFixed(1),
            temp: temp ? temp.trim() : "N/A", // Gestion des cas où la température n'est pas disponible
            ram: parseFloat(ram).toFixed(1),
          };
          ws.send(JSON.stringify({ type: "stats", data: stats }));
        });
      });
    });
  };

  // Envoyer les statistiques toutes les 5 secondes
  const statsInterval = setInterval(sendServerStats, 5000);

  // Gérer les commandes envoyées par l'utilisateur
  ws.on("message", (message) => {
    runSSHCommand(message.toString(), (error, result) => {
      if (error) {
        sendConsoleOutput(`Erreur: ${error.message}`);
      } else {
        sendConsoleOutput(result);
      }
    });
  });

  // Nettoyer l'intervalle lors de la fermeture de la connexion
  ws.on("close", () => {
    clearInterval(statsInterval);
  });
});

// Routes pour les boutons de contrôle
app.post("/startserver", (req, res) => {
  runSSHCommand("screen -S minecraft -X stuff './start.sh\r'", (error, result) => {
    if (error) {
      res.status(500).send(`Erreur: ${error.message}`);
    } else {
      res.send("Serveur démarré avec succès");
    }
  });
});

app.post("/stopserver", (req, res) => {
  runSSHCommand("screen -S minecraft -X stuff 'stop\r'", (error, result) => {
    if (error) {
      res.status(500).send(`Erreur: ${error.message}`);
    } else {
      res.send("Serveur arrêté avec succès");
    }
  });
});

app.post("/restartserver", (req, res) => {
  runSSHCommand("screen -S minecraft -X stuff 'stop\r'", (error, result) => {
    if (error) {
      res.status(500).send(`Erreur: ${error.message}`);
    } else {
      runSSHCommand("screen -S minecraft -X stuff './start.sh\r'", (error, result) => {
        if (error) {
          res.status(500).send(`Erreur: ${error.message}`);
        } else {
          res.send("Serveur redémarré avec succès");
        }
      });
    }
  });
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, "../Frontend")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../Frontend/Html/index.html")));

// Démarrer le serveur HTTP
const server = app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));

// Gérer les connexions WebSocket
server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});