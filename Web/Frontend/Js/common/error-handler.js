/**
 * Gestion des erreurs globales
 */

/**
 * Initialise la gestion des erreurs au chargement du document
 */
document.addEventListener('DOMContentLoaded', () => {
    // Intercepte les erreurs non gérées dans l'application
    window.addEventListener('error', handleGlobalError);
    
    // Intercepte les rejets de promesses non gérés
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    // Surveille la connexion réseau
    setupNetworkMonitoring();
});

/**
 * Gère les erreurs JavaScript globales
 */
function handleGlobalError(event) {
    console.error('Erreur non gérée:', event.error || event.message);
    
    // Si c'est une erreur liée à socket.io ou à la connexion, on peut l'afficher visuellement
    if (event.filename && (event.filename.includes('socket.io') || 
                         event.message.includes('network') || 
                         event.message.includes('connection'))) {
        showConnectionError('Une erreur de connexion est survenue. Consultez la console pour plus de détails.');
        
        // Si c'est une erreur de polling XHR, tenter de changer le transport et reconnecter
        if (event.message && event.message.includes('xhr poll error')) {
            console.log('Tentative de reconnexion avec WebSocket uniquement...');
            if (window.socket) {
                // Forcer le transport WebSocket et tenter de reconnecter
                window.socket.io.opts.transports = ['websocket'];
                
                // Déconnecter puis reconnecter pour appliquer les nouveaux paramètres
                if (window.socket.connected) {
                    window.socket.disconnect();
                }
                
                // Retarder la reconnexion pour laisser le temps au socket de se fermer
                setTimeout(() => {
                    window.socket.connect();
                    console.log("Tentative de reconnexion effectuée");
                }, 1000);
                
                // Afficher un message de reconnexion
                showConnectionInfo('Tentative de reconnexion en cours...');
            }
        }
    }
}

/**
 * Gère les rejets de promesses non gérés
 */
function handlePromiseRejection(event) {
    console.error('Promesse rejetée non gérée:', event.reason);
    
    // Si c'est une erreur liée à la connexion réseau
    if (event.reason && (
        event.reason.toString().includes('network') || 
        event.reason.toString().includes('connection') ||
        event.reason.toString().includes('fetch')
    )) {
        showConnectionError('Une erreur de connexion est survenue. Consultez la console pour plus de détails.');
    }
}

/**
 * Surveille l'état de la connexion réseau
 */
function setupNetworkMonitoring() {
    // Détecter les changements d'état de la connexion
    window.addEventListener('online', () => {
        console.log('La connexion réseau est rétablie');
        hideConnectionError();
        
        // Tenter de reconnecter socket.io si défini
        if (window.socket && typeof window.socket.connect === 'function') {
            window.socket.connect();
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('La connexion réseau est perdue');
        showConnectionError('Connexion réseau perdue. Vérifiez votre connexion Internet.');
    });
}

/**
 * Affiche une notification d'erreur de connexion
 */
function showConnectionError(message) {
    // Vérifier si la notification existe déjà
    let errorNotification = document.getElementById('connection-error-notification');
    
    if (!errorNotification) {
        // Créer la notification
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
        
        // Ajouter un bouton de fermeture
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.style.marginLeft = '15px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '20px';
        closeButton.onclick = hideConnectionError;
        
        // Ajouter le contenu et le bouton à la notification
        errorNotification.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i> ${message}`;
        errorNotification.appendChild(closeButton);
        
        // Ajouter la notification au corps du document
        document.body.appendChild(errorNotification);
    } else {
        // Mettre à jour le message si la notification existe déjà
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

/**
 * Cache la notification d'erreur de connexion
 */
function hideConnectionError() {
    const errorNotification = document.getElementById('connection-error-notification');
    if (errorNotification) {
        errorNotification.remove();
    }
}

/**
 * Affiche une notification d'information
 */
function showConnectionInfo(message) {
    // Vérifier si la notification existe déjà
    let infoNotification = document.getElementById('connection-info-notification');
    
    if (!infoNotification) {
        // Créer la notification
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
        
        // Ajouter un bouton de fermeture
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.style.marginLeft = '15px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '20px';
        closeButton.onclick = function() {
            infoNotification.remove();
        };
        
        // Ajouter le contenu et le bouton à la notification
        infoNotification.innerHTML = `<i class="fas fa-info-circle" style="margin-right: 10px;"></i> ${message}`;
        infoNotification.appendChild(closeButton);
        
        // Ajouter la notification au corps du document
        document.body.appendChild(infoNotification);
        
        // Auto-suppression après 5 secondes
        setTimeout(() => {
            if (infoNotification.parentNode) {
                infoNotification.remove();
            }
        }, 5000);
    } else {
        // Mettre à jour le message si la notification existe déjà
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
