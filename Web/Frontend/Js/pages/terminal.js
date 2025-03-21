/**
 * Terminal interactif avec Xterm.js
 */

let terminal;
let fitAddon;
let wasDisconnected = false;

document.addEventListener('DOMContentLoaded', () => {
    // Utilise toujours le socket global
    if (!window.socket) {
        window.socket = io({
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 30000,
            transports: ['websocket']
        });
    }
    
    // S'assurer que toutes les dépendances sont chargées avant d'initialiser le terminal
    if (typeof Terminal === 'undefined' || typeof FitAddon === 'undefined') {
        console.error("Xterm.js ou FitAddon non disponible. Vérifiez les dépendances.");
        const terminalContainer = document.getElementById('terminal-container');
        if (terminalContainer) {
            terminalContainer.innerHTML = '<div class="terminal-error">Erreur: Impossible de charger le terminal.</div>';
        }
        return;
    }
    
    // Initialisation du terminal
    initializeXterm();
    
    // Écouteurs de socket pour le terminal
    setupSocketListeners();
    
    // Écouteur pour le redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        if (fitAddon) {
            setTimeout(() => fitAddon.fit(), 100);
        }
    });
});

// Initialise le terminal Xterm.js
function initializeXterm() {
    const terminalContainer = document.getElementById('terminal-container');
    if (!terminalContainer) {
        console.error("Conteneur du terminal non trouvé");
        return;
    }
    
    // Vider le conteneur pour éviter les superpositions
    terminalContainer.innerHTML = '';
    
    // Configuration de Xterm
    terminal = new Terminal({
        cursorBlink: true,
        theme: getTerminalTheme(),
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 14,
        lineHeight: 1.2,
        scrollback: 1000,
        convertEol: true, // Convertir les retours à la ligne
        disableStdin: false, // Activer l'entrée
        rendererType: 'canvas' // Utiliser le rendu canvas pour de meilleures performances
    });
    
    // FitAddon pour adapter automatiquement la taille du terminal
    fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);
    
    // Ouvrir le terminal
    try {
        terminal.open(terminalContainer);
        
        // Ajuster la taille du terminal après un court délai
        setTimeout(() => {
            if (fitAddon) {
                try {
                    fitAddon.fit();
                    console.log("Dimensions du terminal ajustées");
                } catch (e) {
                    console.error("Erreur lors de l'ajustement du terminal:", e);
                }
            }
        }, 200);
    } catch (error) {
        console.error("Erreur lors de l'ouverture du terminal:", error);
        terminalContainer.innerHTML = `<div class="terminal-error">Erreur: ${error.message}</div>`;
        return;
    }
    
    // Écouteur d'entrée utilisateur
    terminal.onData(data => {
        if (window.socket && window.socket.connected) {
            window.socket.emit('terminal-input', data);
        } else {
            terminal.writeln('\r\n\x1b[31mNon connecté au serveur\x1b[0m');
        }
    });
    
    // Écouteur de redimensionnement
    terminal.onResize(size => {
        if (window.socket && window.socket.connected) {
            window.socket.emit('terminal-resize', {
                cols: size.cols,
                rows: size.rows
            });
            console.log(`Terminal redimensionné: ${size.cols}x${size.rows}`);
        }
    });
    
    // Rendre le terminal accessible globalement
    window.terminal = terminal;
    
    // Afficher un message initial
    terminal.writeln('=== Terminal Minecraft Server ===');
    terminal.writeln('Initialisation de la connexion...');
}

// Configure les écouteurs de socket pour le terminal
function setupSocketListeners() {
    // Utiliser le socket global au lieu de la variable locale
    const socket = window.socket;
    
    // Sortie du terminal
    socket.on('terminal-output', (data) => {
        if (terminal) {
            terminal.write(data);
        }
    });
    
    // Reconnexion au serveur socket.io
    socket.on('connect', () => {
        if (terminal) {
            terminal.writeln('\r\n\x1b[32mConnexion au serveur établie\x1b[0m\r\n');
        }
        
        // Mise à jour du statut du serveur
        socket.emit('getServerStatus');
        
        // Vérifier si nous devons émettre un signal de reconnexion SSH
        if (wasDisconnected) {
            socket.emit('reconnect-ssh');
            wasDisconnected = false;
        }
    });
    
    // Déconnexion du serveur socket.io
    socket.on('disconnect', () => {
        if (terminal) {
            terminal.writeln('\r\n\x1b[31mDéconnexion du serveur\x1b[0m\r\n');
            terminal.writeln('\x1b[33mTentative de reconnexion automatique...\x1b[0m\r\n');
        }
        wasDisconnected = true;
    });
    
    // Erreur de connexion socket.io
    socket.on('connect_error', (error) => {
        if (terminal) {
            terminal.writeln(`\r\n\x1b[31mErreur de connexion au serveur: ${error.message}\x1b[0m\r\n`);
            terminal.writeln('\x1b[33mConseil: Si l\'erreur persiste, rafraîchissez la page ou vérifiez la connexion au serveur.\x1b[0m\r\n');
        }
    });
    
    // Ajout d'un bouton pour forcer la reconnexion
    addReconnectButton();
    
    // Fermeture du terminal
    socket.on('terminal-close', () => {
        if (terminal) {
            terminal.writeln('\r\n\x1b[31mConnexion fermée\x1b[0m');
        }
    });
    
    // Erreur SSH
    socket.on('sshError', (message) => {
        if (terminal) {
            terminal.writeln(`\r\n\x1b[31mErreur: ${message}\x1b[0m`);
        }
    });
    
    // Mise à jour du statut du serveur
    socket.on('serverStatus', (status) => {
        updateServerStatus(status === 'online');
    });
    
    // Message du serveur
    socket.on('serverMessage', (message) => {
        if (terminal) {
            terminal.writeln(`\r\n\x1b[34m${message}\x1b[0m\r\n`);
        } else {
            alert(message);
        }
    });
}

// Ajoute un bouton de reconnexion
function addReconnectButton() {
    // Utiliser le conteneur dédié au bouton de reconnexion
    const reconnectContainer = document.getElementById('reconnect-container');
    if (!reconnectContainer) return;
    
    // Vérifier si le bouton existe déjà
    if (document.getElementById('reconnect-button')) return;
    
    // Créer le bouton de reconnexion
    const reconnectButton = document.createElement('button');
    reconnectButton.id = 'reconnect-button';
    reconnectButton.innerHTML = '<i class="fas fa-sync-alt"></i> Reconnecter SSH';
    reconnectButton.style.backgroundColor = '#2196F3';
    reconnectButton.style.marginTop = '10px';
    
    // Ajouter l'événement de clic
    reconnectButton.addEventListener('click', () => {
        if (terminal) {
            terminal.writeln('\r\n\x1b[33mTentative de reconnexion SSH...\x1b[0m\r\n');
        }
        window.socket.emit('reconnect-ssh');
    });
    
    // Ajouter le bouton au conteneur
    reconnectContainer.appendChild(reconnectButton);
}

// Retourne le thème du terminal en fonction du thème actuel
function getTerminalTheme() {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    if (theme === 'dark') {
        return {
            background: '#1e1e1e',
            foreground: '#f0f0f0',
            cursor: '#f0f0f0',
            selection: 'rgba(255, 255, 255, 0.3)',
            black: '#000000',
            red: '#e06c75',
            green: '#98c379',
            yellow: '#e5c07b',
            blue: '#61afef',
            magenta: '#c678dd',
            cyan: '#56b6c2',
            white: '#d0d0d0',
            brightBlack: '#808080',
            brightRed: '#ff5370',
            brightGreen: '#c3e88d',
            brightYellow: '#ffcb6b',
            brightBlue: '#82aaff',
            brightMagenta: '#c792ea',
            brightCyan: '#89ddff',
            brightWhite: '#ffffff'
        };
    } else {
        return {
            background: '#f5f5f5',
            foreground: '#2e2e2e',
            cursor: '#333333',
            selection: 'rgba(0, 0, 0, 0.3)',
            black: '#2e2e2e',
            red: '#e06c75',
            green: '#56b6c2',
            yellow: '#e5c07b',
            blue: '#61afef',
            magenta: '#c678dd',
            cyan: '#56b6c2',
            white: '#f0f0f0',
            brightBlack: '#5c6370',
            brightRed: '#e06c75',
            brightGreen: '#56b6c2',
            brightYellow: '#e5c07b',
            brightBlue: '#61afef',
            brightMagenta: '#c678dd',
            brightCyan: '#56b6c2',
            brightWhite: '#ffffff'
        };
    }
}

// Met à jour le thème du terminal
function updateTerminalTheme() {
    if (terminal) {
        terminal.setOption('theme', getTerminalTheme());
    }
}

// Extension de la fonction de mise à jour du thème
if (window.updateChartsTheme) {
    const originalUpdateTheme = window.updateChartsTheme;
    window.updateChartsTheme = function() {
        originalUpdateTheme();
        updateTerminalTheme();
    };
} else {
    window.updateChartsTheme = updateTerminalTheme;
}
