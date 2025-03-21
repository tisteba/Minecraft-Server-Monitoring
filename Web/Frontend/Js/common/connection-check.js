/**
 * Vérification des connexions
 */

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkSocketConnection, 1000);
        setInterval(checkSocketConnection, 10000);
});

// Vérifie la connexion socket.io
function checkSocketConnection() {
    if (window.socket) {
        console.log("Socket connection status:", window.socket.connected);
        
        if (!window.socket.connected) {
            console.log("Socket not connected, attempting reconnect...");
            window.socket.connect();
            
            if (window.terminal) {
                setTimeout(() => {
                    window.socket.emit('reconnect-ssh');
                }, 2000);
            }
        } else {
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

// Force le rechargement de la page en cas de problèmes persistants
function forcePageRefresh() {
    localStorage.setItem('pageRefreshed', 'true');
    window.location.reload();
}

// Gestion spéciale après un rechargement de page dû à des problèmes de connexion
if (localStorage.getItem('pageRefreshed') === 'true') {
    localStorage.removeItem('pageRefreshed');
    console.log("Page was refreshed due to connection issues - using WebSocket only");
    
    window.addEventListener('error', (event) => {
        if (event.message && event.message.includes('connection') || event.message.includes('socket')) {
            const errorCount = parseInt(localStorage.getItem('connectionErrorCount') || '0') + 1;
            localStorage.setItem('connectionErrorCount', errorCount.toString());
            
            console.log(`Connection error detected (${errorCount}/3)`);
            
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
