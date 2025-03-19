const express = require('express');
const { exec } = require('child_process');
const WebSocket = require('ws');
const app = express();
const wss = new WebSocket.Server({ noServer: true });

// Fonction pour récupérer l'utilisation du CPU
const getCpuUsage = () => {
  return new Promise((resolve, reject) => {
    exec("top -bn1 | grep 'Cpu(s)'", (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Fonction pour récupérer l'utilisation de la RAM
const getRamUsage = () => {
  return new Promise((resolve, reject) => {
    exec("free -m", (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Fonction pour récupérer l'utilisation du disque
const getDiskUsage = () => {
  return new Promise((resolve, reject) => {
    exec("df -h", (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Fonction pour démarrer le serveur Minecraft Bedrock
const startServer = () => {
  return new Promise((resolve, reject) => {
    exec("./bedrock_server", (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve('Server started');
      }
    });
  });
};

// Fonction pour arrêter le serveur Minecraft Bedrock
const stopServer = () => {
  return new Promise((resolve, reject) => {
    exec("pkill -f 'bedrock_server'", (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve('Server stopped');
      }
    });
  });
};

// Fonction pour redémarrer le serveur Minecraft Bedrock
const restartServer = () => {
  return new Promise((resolve, reject) => {
    stopServer()
      .then(() => startServer())
      .then(resolve)
      .catch(reject);
  });
};

// Gérer les connexions WebSocket
wss.on('connection', (ws) => {
  const sendData = async () => {
    try {
      const cpu = await getCpuUsage();
      const ram = await getRamUsage();
      const disk = await getDiskUsage();

      // Envoyer les données système au client en format JSON
      ws.send(JSON.stringify({ cpu, ram, disk }));
    } catch (error) {
      ws.send(JSON.stringify({ error }));
    }
  };

  // Envoi des informations toutes les 5 secondes
  const intervalId = setInterval(sendData, 5000);

  ws.on('close', () => {
    clearInterval(intervalId); // Arrêter l'intervalle lorsque la connexion est fermée
  });
});

// Serveur Express pour servir le frontend et gérer les commandes
app.use(express.static('public'));

// Commandes HTTP pour contrôler le serveur
app.get('/startserver', async (req, res) => {
  try {
    await startServer();
    res.send('Server started');
  } catch (error) {
    res.send(`Error starting server: ${error}`);
  }
});

app.get('/stopserver', async (req, res) => {
  try {
    await stopServer();
    res.send('Server stopped');
  } catch (error) {
    res.send(`Error stopping server: ${error}`);
  }
});

app.get('/restartserver', async (req, res) => {
  try {
    await restartServer();
    res.send('Server restarted');
  } catch (error) {
    res.send(`Error restarting server: ${error}`);
  }
});

// Lancer le serveur HTTP
const server = app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});

// Lier WebSocket au serveur HTTP
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
