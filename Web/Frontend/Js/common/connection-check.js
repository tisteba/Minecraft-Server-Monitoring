/**
 * Module de vérification des connexions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Attendre que socket.io soit chargé
    setTimeout(checkSocketConnection, 1000);
    
    // Vérification périodique
    setInterval(checkSocketConnection, 10000);
});

/**
 * Vérifie la connexion socket.io
 */
function checkSocketConnection() {
    if (window.socket) {
        console.log("Socket connection status:", window.socket.connected);
        
        if (!window.socket.connected) {
            console.log("Socket not connected, attempting reconnect...");
            window.socket.connect();
            
            // Réinitialiser le terminal si on a perdu la connexion
            if (window.terminal) {
                setTimeout(() => {
                    window.socket.emit('reconnect-ssh');
                }, 2000);
            }
        } else {
            // Test ping-pong pour vérifier que la connexion est active
            const startTime = Date.now();
            window.socket.emit('ping', () => {
                const latency = Date.now() - startTime;
                console.log(`Socket connection confirmed (latency: ${latency}ms)`);
            });
        }
    } else {
        console.log("Socket not initialized yet");
    }
}

/**
 * Force le rechargement de la page en cas de problèmes persistants
 */
function forcePageRefresh() {
    localStorage.setItem('pageRefreshed', 'true');
    window.location.reload();
}

// Si la page a été rechargée suite à des problèmes de connexion,
// utiliser uniquement WebSocket
if (localStorage.getItem('pageRefreshed') === 'true') {
    localStorage.removeItem('pageRefreshed');
    console.log("Page was refreshed due to connection issues - using WebSocket only");
    
    // Ajouter un écouteur pour les erreurs de connexion persistantes
    window.addEventListener('error', (event) => {
        if (event.message && event.message.includes('connection') || event.message.includes('socket')) {
            // Compteur d'erreurs
            const errorCount = parseInt(localStorage.getItem('connectionErrorCount') || '0') + 1;
            localStorage.setItem('connectionErrorCount', errorCount.toString());
            
            console.log(`Connection error detected (${errorCount}/3)`);
            
            // Si plus de 3 erreurs en peu de temps, suggérer une actualisation manuelle
            if (errorCount >= 3) {
                localStorage.removeItem('connectionErrorCount');
                
                const refreshConfirm = confirm(
                    "Des problèmes de connexion persistent. Voulez-vous actualiser la page?"
                );
                
                if (refreshConfirm) {
                    window.location.reload();
                }
            }
        }
    });
}
