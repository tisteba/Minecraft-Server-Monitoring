/**
 * Gestion des erreurs globales
 */

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    setupNetworkMonitoring();
});

// Gère les erreurs JavaScript globales
function handleGlobalError(event) {
    console.error('Erreur non gérée:', event.error || event.message);
    
    // Si c'est une erreur liée à socket.io ou à la connexion
    if (event.filename && (event.filename.includes('socket.io') || 
                         event.message.includes('network') || 
                         event.message.includes('connection'))) {
        showConnectionError('Une erreur de connexion est survenue. Consultez la console pour plus de détails.');
        
        // Si c'est une erreur de polling XHR, tenter de changer le transport
        if (event.message && event.message.includes('xhr poll error')) {
            console.log('Tentative de reconnexion avec WebSocket uniquement...');
            if (window.socket) {
                window.socket.io.opts.transports = ['websocket'];
                
                if (window.socket.connected) {
                    window.socket.disconnect();
                }
                
                setTimeout(() => {
                    window.socket.connect();
                    console.log("Tentative de reconnexion effectuée");
                }, 1000);
                
                showConnectionInfo('Tentative de reconnexion en cours...');
            }
        }
    }
}

// Gère les rejets de promesses non gérés
function handlePromiseRejection(event) {
    console.error('Promesse rejetée non gérée:', event.reason);
    
    if (event.reason && (
        event.reason.toString().includes('network') || 
        event.reason.toString().includes('connection') ||
        event.reason.toString().includes('fetch')
    )) {
        showConnectionError('Une erreur de connexion est survenue. Consultez la console pour plus de détails.');
    }
}

// Surveille l'état de la connexion réseau
function setupNetworkMonitoring() {
    window.addEventListener('online', () => {
        console.log('La connexion réseau est rétablie');
        hideConnectionError();
        
        if (window.socket && typeof window.socket.connect === 'function') {
            window.socket.connect();
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('La connexion réseau est perdue');
        showConnectionError('Connexion réseau perdue. Vérifiez votre connexion Internet.');
    });
}

// Affiche une notification d'erreur de connexion
function showConnectionError(message) {
    let errorNotification = document.getElementById('connection-error-notification');
    
    if (!errorNotification) {
        errorNotification = document.createElement('div');
        errorNotification.id = 'connection-error-notification';
        errorNotification.style.position = 'fixed';
        errorNotification.style.top = '20px';
        errorNotification.style.left = '50%';
        errorNotification.style.transform = 'translateX(-50%)';
        errorNotification.style.backgroundColor = '#f44336';
        errorNotification.style.color = 'white';
        errorNotification.style.padding = '15px 20px';
        errorNotification.style.borderRadius = '4px';
        errorNotification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        errorNotification.style.zIndex = '9999';
        errorNotification.style.display = 'flex';
        errorNotification.style.alignItems = 'center';
        errorNotification.style.maxWidth = '80%';
        
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.style.marginLeft = '15px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '20px';
        closeButton.onclick = hideConnectionError;
        
        errorNotification.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i> ${message}`;
        errorNotification.appendChild(closeButton);
        
        document.body.appendChild(errorNotification);
    } else {
        errorNotification.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i> ${message}`;
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.style.marginLeft = '15px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '20px';
        closeButton.onclick = hideConnectionError;
        errorNotification.appendChild(closeButton);
    }
}

// Cache la notification d'erreur de connexion
function hideConnectionError() {
    const errorNotification = document.getElementById('connection-error-notification');
    if (errorNotification) {
        errorNotification.remove();
    }
}

// Affiche une notification d'information
function showConnectionInfo(message) {
    let infoNotification = document.getElementById('connection-info-notification');
    
    if (!infoNotification) {
        infoNotification = document.createElement('div');
        infoNotification.id = 'connection-info-notification';
        infoNotification.style.position = 'fixed';
        infoNotification.style.top = '70px'; // Sous l'erreur si présente
        infoNotification.style.left = '50%';
        infoNotification.style.transform = 'translateX(-50%)';
        infoNotification.style.backgroundColor = '#2196F3';
        infoNotification.style.color = 'white';
        infoNotification.style.padding = '15px 20px';
        infoNotification.style.borderRadius = '4px';
        infoNotification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        infoNotification.style.zIndex = '9998';
        infoNotification.style.display = 'flex';
        infoNotification.style.alignItems = 'center';
        infoNotification.style.maxWidth = '80%';
        
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.style.marginLeft = '15px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '20px';
        closeButton.onclick = function() {
            infoNotification.remove();
        };
        
        infoNotification.innerHTML = `<i class="fas fa-info-circle" style="margin-right: 10px;"></i> ${message}`;
        infoNotification.appendChild(closeButton);
        
        document.body.appendChild(infoNotification);
        
        setTimeout(() => {
            if (infoNotification.parentNode) {
                infoNotification.remove();
            }
        }, 5000);
    } else {
        infoNotification.innerHTML = `<i class="fas fa-info-circle" style="margin-right: 10px;"></i> ${message}`;
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.style.marginLeft = '15px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '20px';
        closeButton.onclick = function() {
            infoNotification.remove();
        };
        infoNotification.appendChild(closeButton);
    }
}
