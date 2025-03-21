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
// Fixed duplicate declaration - using only one io configuration with all needed options
const io = new Server(server, {
    transports: ['websocket'], // Force WebSocket to avoid polling issues
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static("../Frontend"));
app.use(fileUpload());

// Améliorations de la configuration SSH pour éviter les erreurs de connexion
const sshConfig = {
    host: "wilfart.fr",
    port: 2010,
    username: "serveur-minecraft",
    privateKey: fs.readFileSync("C:/Users/amgoa/.ssh/id_rsa_MineServ"),
    // Options simplifiées pour éviter les erreurs
    readyTimeout: 30000,
    keepaliveInterval: 30000,
    keepaliveCountMax: 5
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
    console.log("Nouvelle connexion WebSocket", socket.id);
    
    let ssh = new Client();
    let sshStream;
    let reconnectAttempts = 0;
    let maxReconnectAttempts = 5; // Augmenté pour plus de tentatives
    let reconnectTimeout;
    let resourceInterval;
    let isConnected = false;
    
    // Fonction pour récupérer les vraies informations système du serveur
    function getSystemInfo() {
        if (!ssh || !isConnected) return;
        
        // Commande pour obtenir l'utilisation CPU
        ssh.exec("top -bn1 | grep 'Cpu(s)' | awk '{print $2+$4}'", (err, stream) => {
            if (err) {
                console.error("Erreur lors de la récupération du CPU:", err);
                return;
            }
            
            let cpuOutput = '';
            stream.on('data', (data) => cpuOutput += data.toString());
            stream.on('close', () => {
                const cpuUsage = parseFloat(cpuOutput.trim());
                if (!isNaN(cpuUsage)) {
                    socket.emit("cpuUsage", cpuUsage);
                }
            });
        });
        
        // Commande pour obtenir l'utilisation RAM
        ssh.exec("free | grep Mem | awk '{print ($3/$2) * 100.0}'", (err, stream) => {
            if (err) {
                console.error("Erreur lors de la récupération de la RAM:", err);
                return;
            }
            
            let ramOutput = '';
            stream.on('data', (data) => ramOutput += data.toString());
            stream.on('close', () => {
                const ramUsage = parseFloat(ramOutput.trim());
                if (!isNaN(ramUsage)) {
                    socket.emit("ramUsage", ramUsage);
                }
            });
        });
        
        // Commande pour obtenir l'espace disque
        ssh.exec("df -h / | tail -1 | awk '{print $2,$3,$4,$5}'", (err, stream) => {
            if (err) {
                console.error("Erreur lors de la récupération de l'espace disque:", err);
                return;
            }
            
            let diskOutput = '';
            stream.on('data', (data) => diskOutput += data.toString());
            stream.on('close', () => {
                const parts = diskOutput.trim().split(/\s+/);
                if (parts.length >= 4) {
                    const total = parts[0];
                    const used = parts[1];
                    const free = parts[2];
                    const usedPercent = parseInt(parts[3].replace('%', ''));
                    
                    // Convertir les valeurs en octets pour le formatage côté client
                    const totalBytes = parseHumanReadableToBytes(total);
                    const usedBytes = parseHumanReadableToBytes(used);
                    const freeBytes = parseHumanReadableToBytes(free);
                    
                    socket.emit("diskInfo", {
                        total: totalBytes,
                        used: usedBytes,
                        free: freeBytes,
                        usedPercent: usedPercent
                    });
                }
            });
        });
        
        // Commande pour obtenir les statistiques réseau
        ssh.exec("cat /proc/net/dev | grep eth0 || cat /proc/net/dev | grep ens", (err, stream) => {
            if (err) {
                console.error("Erreur lors de la récupération des stats réseau:", err);
                return;
            }
            
            let netOutput = '';
            stream.on('data', (data) => netOutput += data.toString());
            stream.on('close', () => {
                const line = netOutput.trim().split('\n')[0];
                if (line) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 10) {
                        // Les valeurs typiques sont rx_bytes, rx_packets... tx_bytes, tx_packets...
                        const rx_bytes = parseInt(parts[1]);
                        const tx_bytes = parseInt(parts[9]);
                        
                        // Stocker temporairement pour calculer la différence
                        const now = Date.now();
                        if (socket.lastNetworkStats && now - socket.lastNetworkTime > 0) {
                            const timeDiff = (now - socket.lastNetworkTime) / 1000; // en secondes
                            const rx_diff = rx_bytes - socket.lastNetworkStats.rx;
                            const tx_diff = tx_bytes - socket.lastNetworkStats.tx;
                            
                            socket.emit("networkStats", {
                                rx_sec: Math.max(0, rx_diff / timeDiff), // bytes/sec
                                tx_sec: Math.max(0, tx_diff / timeDiff)  // bytes/sec
                            });
                        }
                        
                        socket.lastNetworkStats = { rx: rx_bytes, tx: tx_bytes };
                        socket.lastNetworkTime = now;
                    }
                }
            });
        });
        
        // Commande pour obtenir l'uptime et d'autres informations
        ssh.exec("uptime -p && hostname -I", (err, stream) => {
            if (err) {
                console.error("Erreur lors de la récupération de l'uptime:", err);
                return;
            }
            
            let uptimeOutput = '';
            stream.on('data', (data) => uptimeOutput += data.toString());
            stream.on('close', () => {
                const lines = uptimeOutput.trim().split('\n');
                const uptime = lines[0].replace('up ', '');
                const ip = lines[1]?.trim().split(' ')[0] || 'Non disponible';
                
                // Obtenir le nombre de joueurs actifs via un fichier spécifique à Minecraft
                ssh.exec("cat /home/serveur-minecraft/serverLogs/logs/latest.log | grep 'joined the game' | wc -l", (err, playerStream) => {
                    let playerCount = '0';
                    
                    if (!err) {
                        playerStream.on('data', (data) => playerCount = data.toString().trim());
                        playerStream.on('close', () => {
                            socket.emit("serverInfo", {
                                ip: ip,
                                uptime: uptime,
                                activePlayers: parseInt(playerCount) || 0,
                                maxPlayers: 20
                            });
                        });
                    } else {
                        socket.emit("serverInfo", {
                            ip: ip,
                            uptime: uptime,
                            activePlayers: 0,
                            maxPlayers: 20
                        });
                    }
                });
            });
        });
    }
    
    function connectSSH() {
        console.log("Tentative de connexion SSH...");
        
        // Réinitialiser le client SSH en cas de reconnexion
        if (ssh.end) {
            try {
                ssh.end();
            } catch (error) {
                console.error("Erreur lors de la fermeture du SSH:", error);
            }
        }
        
        ssh = new Client();
        isConnected = false;
        
        // Gérer l'événement "ready"
        ssh.on("ready", () => {
            console.log("Connexion SSH établie");
            isConnected = true;
            reconnectAttempts = 0; // Réinitialiser les tentatives après une connexion réussie
            
            ssh.shell((err, stream) => {
                if (err) {
                    console.error("Erreur de shell SSH:", err);
                    socket.emit("terminal-output", "\r\n\x1b[31mErreur d'ouverture du shell: " + err.message + "\x1b[0m\r\n");
                    return;
                }
                
                sshStream = stream;
                
                // Événements pour Xterm.js
                stream.on("data", (data) => {
                    socket.emit("terminal-output", data.toString("utf-8"));
                });
                
                stream.on("close", () => {
                    socket.emit("terminal-output", "\r\n\x1b[33mSession shell fermée\x1b[0m\r\n");
                    console.log("Stream SSH fermé");
                    sshStream = null;
                });
                
                stream.stderr.on("data", (data) => {
                    socket.emit("terminal-output", data.toString("utf-8"));
                });
                
                // Notification de connexion réussie
                socket.emit("terminal-output", "\x1b[32mConnexion SSH établie. Terminal prêt.\x1b[0m\r\n");
                
                // Vérification initiale du statut du serveur
                checkMinecraftStatus();
                
                // Commencer à récupérer les informations système
                getSystemInfo();
                
                // Lancer l'intervalle de récupération des informations système
                clearInterval(resourceInterval);
                resourceInterval = setInterval(getSystemInfo, 5000);
            });
        });
        
        // Amélioration de la gestion des erreurs SSH
        ssh.on("error", (err) => {
            console.error("Erreur SSH:", err.message);
            
            // Pour éviter les erreurs dues à une déconnexion normale
            if (err.message.includes('ECONNRESET') || err.message.includes('Connection lost')) {
                socket.emit("terminal-output", `\r\n\x1b[31mConnexion SSH perdue: ${err.message}\x1b[0m\r\n`);
            } else {
                socket.emit("terminal-output", `\r\n\x1b[31mErreur de connexion SSH: ${err.message}\x1b[0m\r\n`);
            }
            
            // Gestion des tentatives de reconnexion
            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                
                const delay = reconnectAttempts * 2000; // Délai croissant entre les tentatives
                socket.emit("terminal-output", `\x1b[33mTentative de reconnexion (${reconnectAttempts}/${maxReconnectAttempts}) dans ${delay/1000} secondes...\x1b[0m\r\n`);
                
                clearTimeout(reconnectTimeout);
                reconnectTimeout = setTimeout(() => {
                    connectSSH();
                }, delay);
            } else {
                socket.emit("terminal-output", "\x1b[31mNombre maximum de tentatives de reconnexion atteint. Veuillez rafraîchir la page.\x1b[0m\r\n");
            }
        });
        
        // Gérer l'événement "end"
        ssh.on("end", () => {
            console.log("Connexion SSH terminée");
        });
        
        // Gérer l'événement "close"
        ssh.on("close", (hadError) => {
            console.log("Connexion SSH fermée", hadError ? "avec erreur" : "normalement");
            if (hadError && reconnectAttempts < maxReconnectAttempts) {
                // Si fermé avec erreur et reconnexions autorisées, on tente de se reconnecter
                const delay = reconnectAttempts * 2000;
                socket.emit("terminal-output", `\x1b[33mConnexion perdue. Tentative de reconnexion dans ${delay/1000} secondes...\x1b[0m\r\n`);
                
                clearTimeout(reconnectTimeout);
                reconnectTimeout = setTimeout(() => {
                    connectSSH();
                }, delay);
            }
        });
        
        // Connexion SSH avec timeout
        try {
            ssh.connect(sshConfig);
        } catch (err) {
            console.error("Erreur lors de la tentative de connexion:", err);
            socket.emit("terminal-output", `\r\n\x1b[31mErreur de connexion: ${err.message}\x1b[0m\r\n`);
        }
    }

    // Démarrer la connexion initiale
    connectSSH();

    socket.on("terminal-input", (data) => {
        if (sshStream) {
            sshStream.write(data);
        } else {
            // Tenter de reconnecter si le stream est perdu
            socket.emit("terminal-output", "\r\n\x1b[33mTentative de restauration de la connexion...\x1b[0m\r\n");
            connectSSH();
        }
    });

    socket.on("terminal-resize", (data) => {
        if (sshStream) {
            sshStream.setWindow(data.rows, data.cols);
        }
    });

    socket.on("serverControl", (action) => {
        console.log(`Commande serveur reçue: ${action}`);
        
        let cmd = action === "start" ? "systemctl start minecraft" :
                  action === "stop" ? "systemctl stop minecraft" :
                  "systemctl restart minecraft";
        
        try {
            if (!ssh || ssh._sock?.destroyed) {
                console.error("SSH non connecté, impossible d'exécuter la commande");
                socket.emit("serverMessage", `Erreur: Connexion SSH non disponible. Impossible d'exécuter ${action}.`);
                return;
            }
            
            ssh.exec(cmd, (err, stream) => {
                if (err) {
                    console.error(`Erreur d'exécution ${action}:`, err);
                    socket.emit("serverMessage", `Erreur lors de l'action ${action}: ${err.message}`);
                    return;
                }
                
                let output = '';
                
                stream.on("data", (data) => {
                    output += data.toString();
                });
                
                stream.stderr.on("data", (data) => {
                    output += data.toString();
                });
                
                stream.on("close", () => {
                    console.log(`Commande ${action} exécutée: ${output || 'OK'}`);
                    socket.emit("serverMessage", `Serveur ${action} - ${output || 'Commande exécutée'}`);
                    
                    // Mettre à jour le statut après un court délai
                    setTimeout(() => {
                        checkServerStatus(ssh, socket);
                    }, 1000);
                });
            });
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la commande ${action}:`, error);
            socket.emit("serverMessage", `Erreur lors de l'action ${action}: ${error.message}`);
        }
    });

    // Vérification initiale du statut du serveur
    checkServerStatus(ssh, socket);

    // Remplacer l'ancien intervalle de ressources par notre nouvelle fonction
    clearInterval(resourceInterval);
    
    // Fonction pour vérifier le statut du serveur Minecraft (en utilisant systemctl directement)
    function checkMinecraftStatus() {
        if (!ssh || !isConnected) {
            socket.emit("serverStatus", "offline");
            return;
        }
        
        ssh.exec("systemctl is-active minecraft || echo 'offline'", (err, stream) => {
            if (err) {
                console.error("Erreur de vérification du statut:", err);
                socket.emit("serverStatus", "offline");
                return;
            }
            
            let status = '';
            
            stream.on("data", (data) => {
                status += data.toString().trim();
            });
            
            stream.on("close", () => {
                console.log("Statut du serveur Minecraft:", status);
                socket.emit("serverStatus", status === "active" ? "online" : "offline");
            });
        });
    }

    // Socket handler pour la commande ping
    socket.on("ping", (callback) => {
        if (typeof callback === 'function') {
            callback();
        }
    });

    // Corriger la fonction checkServerStatus pour utiliser checkMinecraftStatus directement
    function checkServerStatus(ssh, socket) {
        checkMinecraftStatus();
    }

    // Envoi des données de CPU/RAM et autres statistiques - FIX
    resourceInterval = setInterval(() => {
        // Utiliser les vraies données uniquement si la connexion SSH est établie
        if (isConnected) {
            // getSystemInfo sera appelé après la connexion SSH réussie
            return;
        }
        
        try {
            // Mode de secours : utiliser les données simulées si SSH n'est pas connecté
            console.log("Utilisation des données simulées (SSH non connecté)");
            
            // CPU et RAM
            os.cpuUsage((v) => {
                const cpuValue = v * 100;
                socket.emit("cpuUsage", cpuValue);
            });
            
            const ramValue = (1 - os.freememPercentage()) * 100;
            socket.emit("ramUsage", ramValue);
            
            // Autres données simulées
            socket.emit("diskInfo", {
                total: 100 * 1024 * 1024 * 1024,
                used: 42 * 1024 * 1024 * 1024,
                free: 58 * 1024 * 1024 * 1024,
                usedPercent: 42
            });
            
            socket.emit("networkStats", {
                rx_sec: Math.floor(Math.random() * 500000) + 50000,
                tx_sec: Math.floor(Math.random() * 200000) + 30000
            });
            
            socket.emit("serverInfo", {
                ip: "Non connecté",
                uptime: "Non disponible",
                activePlayers: 0,
                maxPlayers: 20
            });
            
            socket.emit("serverStatus", "offline");
        } catch (error) {
            console.error("Error sending simulated data:", error);
        }
    }, 3000);

    // Reconnexion SSH
    socket.on("reconnect-ssh", () => {
        console.log("Tentative de reconnexion SSH demandée par le client");
        connectSSH();
    });

    socket.on("disconnect", () => {
        console.log("Déconnexion du client WebSocket");
        clearTimeout(reconnectTimeout);
        clearInterval(resourceInterval);
        if (sshStream) {
            try {
                sshStream.end();
            } catch (err) {
                console.error("Erreur lors de la fermeture du stream SSH:", err);
            }
        }
        if (ssh) {
            try {
                ssh.end();
            } catch (err) {
                console.error("Erreur lors de la fermeture de la connexion SSH:", err);
            }
        }
    });
});

/**
 * Utilitaire pour convertir des tailles lisibles par l'homme (comme 1.5G) en octets
 */
function parseHumanReadableToBytes(sizeStr) {
    const units = {
        'B': 1,
        'K': 1024,
        'M': 1024 * 1024,
        'G': 1024 * 1024 * 1024,
        'T': 1024 * 1024 * 1024 * 1024,
    };
    
    try {
        // Extraire le nombre et l'unité
        const match = sizeStr.match(/^(\d+(?:\.\d+)?)([BKMGT])/i);
        if (match) {
            const size = parseFloat(match[1]);
            const unit = match[2].toUpperCase();
            return size * units[unit];
        }
        
        // Gestion simple si la regex ne correspond pas
        const numericValue = parseFloat(sizeStr);
        if (!isNaN(numericValue)) {
            return numericValue;
        }
    } catch (e) {
        console.error("Erreur de parsing de la taille:", e);
    }
    
    // Valeur par défaut
    return 0;
}

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
