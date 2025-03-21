/**
 * Fonctionnalités du tableau de bord
 */

// Initialiser socket.io de manière globale
if (!window.socket) {
    window.socket = io({
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 30000,
        transports: ['websocket'], // Force WebSocket uniquement pour éviter l'erreur xhr poll
        forceNew: true
    });
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des graphiques
    if (document.getElementById('cpuChart') && document.getElementById('ramChart')) {
        initializeCharts();
    }
    
    // Initialiser le graphique réseau
    if (document.getElementById('networkChart')) {
        initializeNetworkChart();
    }

    // Debug - vérification de connexion
    window.socket.on("connect", () => {
        console.log("Socket connected:", window.socket.connected);
        console.log("Socket ID:", window.socket.id);
    });

    // Debug - affichage des erreurs
    window.socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
    });
});

// ==== SURVEILLANCE DES RESSOURCES ====

/**
 * Utilisation CPU en temps réel
 */
window.socket.on("cpuUsage", (usage) => {
    console.log("CPU Usage received:", usage);
    const cpuValue = parseFloat(usage).toFixed(2);
    const cpuElement = document.getElementById("cpuUsage");
    if (cpuElement) {
        cpuElement.innerText = cpuValue + "%";
    }
    
    // Met à jour le graphique si disponible
    if (window.cpuData && window.cpuChart) {
        updateChartData(window.cpuData, window.cpuChart, cpuValue);
    }
});

/**
 * Utilisation RAM en temps réel
 */
window.socket.on("ramUsage", (usage) => {
    console.log("RAM Usage received:", usage);
    const ramValue = parseFloat(usage).toFixed(2);
    const ramElement = document.getElementById("ramUsage");
    if (ramElement) {
        ramElement.innerText = ramValue + "%";
    }
    
    // Met à jour le graphique si disponible
    if (window.ramData && window.ramChart) {
        updateChartData(window.ramData, window.ramChart, ramValue);
    }
});

/**
 * Informations sur l'espace disque
 */
window.socket.on("diskInfo", (diskInfo) => {
    console.log("Disk info received:", diskInfo);
    const diskUsageBar = document.getElementById("diskUsageBar");
    const diskUsagePercent = document.getElementById("diskUsagePercent");
    const diskUsageText = document.getElementById("diskUsageText");
    
    if (diskUsageBar && diskUsagePercent && diskUsageText) {
        const usedPercent = parseFloat(diskInfo.usedPercent).toFixed(1);
        const used = formatBytes(diskInfo.used);
        const total = formatBytes(diskInfo.total);
        
        diskUsageBar.style.width = usedPercent + "%";
        diskUsagePercent.textContent = usedPercent + "%";
        diskUsageText.textContent = `${used} / ${total}`;
        
        // Changer la couleur en fonction de l'utilisation
        if (usedPercent > 90) {
            diskUsageBar.style.background = "linear-gradient(90deg, var(--error-red) 0%, #ff7676 100%)";
        } else if (usedPercent > 70) {
            diskUsageBar.style.background = "linear-gradient(90deg, var(--warning-orange) 0%, #ffbf7f 100%)";
        } else {
            diskUsageBar.style.background = "linear-gradient(90deg, var(--primary-blue) 0%, var(--accent-blue) 100%)";
        }
    }
});

/**
 * Informations générales du serveur
 */
window.socket.on("serverInfo", (info) => {
    console.log("Server info received:", info);
    const serverIPElement = document.getElementById("serverIP");
    const serverUptimeElement = document.getElementById("serverUptime");
    const activePlayersElement = document.getElementById("activePlayers");
    
    if (serverIPElement) {
        serverIPElement.textContent = info.ip || "N/A";
    }
    
    if (serverUptimeElement) {
        // Formatter l'uptime correctement si c'est une chaîne
        if (typeof info.uptime === 'string') {
            serverUptimeElement.textContent = info.uptime;
        } else {
            serverUptimeElement.textContent = formatUptime(info.uptime) || "N/A";
        }
    }
    
    if (activePlayersElement) {
        activePlayersElement.textContent = `${info.activePlayers || 0}/${info.maxPlayers || 0}`;
    }
});

/**
 * Statistiques réseau en temps réel
 */
window.socket.on("networkStats", (stats) => {
    console.log("Network stats received:", stats);
    if (window.networkChart) {
        updateNetworkChart(window.networkChart, stats.rx_sec / 1024, stats.tx_sec / 1024);
    }
});

/**
 * Contrôle du serveur (démarrer, arrêter, redémarrer)
 */
function serverAction(action) {
    console.log("Server action requested:", action);
    // Afficher un message de chargement
    const statusElement = document.getElementById('serverStatus');
    if (statusElement) {
        statusElement.className = 'server-status status-pending';
        statusElement.textContent = 'En cours...';
    }
    
    window.socket.emit("serverControl", action);
}

/**
 * Initialisation des graphiques
 */
function initializeCharts() {
    const cpuChartCtx = document.getElementById('cpuChart');
    const ramChartCtx = document.getElementById('ramChart');
    
    if (!cpuChartCtx || !ramChartCtx) {
        console.error("Charts canvas not found");
        return;
    }
    
    // S'assurer que les dimensions des canvas sont correctes
    setCanvasDimensions(cpuChartCtx);
    setCanvasDimensions(ramChartCtx);
    
    // Obtenir les couleurs basées sur le thème actuel
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    // Configuration commune des graphiques
    const chartConfig = {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', '', '', '', ''],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderWidth: 2,
                tension: 0,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false,
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    min: 0,
                    max: 100,
                    grid: {
                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                        font: {
                            size: 10
                        },
                        stepSize: 25,
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            elements: {
                line: {
                    tension: 0
                },
                point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 4
                }
            },
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x'
            },
            hover: {
                mode: 'nearest',
                intersect: false
            }
        }
    };
    
    // Configuration CPU
    const cpuConfig = JSON.parse(JSON.stringify(chartConfig));
    cpuConfig.data.datasets = [{
        label: 'Utilisation CPU',
        data: Array(10).fill(0),
        borderColor: '#1e88e5',
        backgroundColor: 'rgba(30, 136, 229, 0.2)',
        pointBackgroundColor: '#1e88e5'
    }];
    
    // Configuration RAM
    const ramConfig = JSON.parse(JSON.stringify(chartConfig));
    ramConfig.data.datasets = [{
        label: 'Utilisation RAM',
        data: Array(10).fill(0),
        borderColor: '#8e24aa',
        backgroundColor: 'rgba(142, 36, 170, 0.2)',
        pointBackgroundColor: '#8e24aa'
    }];
    
    // Création des graphiques
    window.cpuChart = new Chart(cpuChartCtx, cpuConfig);
    window.ramChart = new Chart(ramChartCtx, ramConfig);
    
    // Initialisation des données
    window.cpuData = Array(10).fill(0);
    window.ramData = Array(10).fill(0);
    
    // Force resize charts après un délai
    setTimeout(() => {
        if (window.cpuChart) window.cpuChart.resize();
        if (window.ramChart) window.ramChart.resize();
        console.log("Charts resized for proper display");
    }, 500);
    
    // Démarrer la simulation
    startSimulation();
}

/**
 * Helper function to ensure canvas dimensions are set correctly
 */
function setCanvasDimensions(canvas) {
    if (!canvas) return;
    
    // Set display style
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    // Clear any inline max-height that might be interfering
    canvas.style.maxHeight = 'none';
    
    // Set the parent container to be visible with a minimum height
    const container = canvas.parentElement;
    if (container) {
        container.style.minHeight = '300px';
        container.style.position = 'relative';
        container.style.overflow = 'visible';
    }
    
    // Log the canvas dimensions for debugging
    console.log(`Canvas ${canvas.id} dimensions set - Width: ${canvas.width}, Height: ${canvas.height}`);
}

// Add a window resize handler to adjust charts when window size changes
window.addEventListener('resize', () => {
    if (window.cpuChart) window.cpuChart.resize();
    if (window.ramChart) window.ramChart.resize(); // Correction: c'était window.cpuChart.resize()
    if (window.networkChart) window.networkChart.resize();
    console.log("Charts resized due to window resize");
});

/**
 * Initialisation du graphique réseau fusionné
 */
function initializeNetworkChart() {
    const networkChartCtx = document.getElementById('networkChart');
    if (!networkChartCtx) {
        console.error("Network chart canvas not found");
        return;
    }
    
    // Configuration du graphique
    const chartConfig = {
        type: 'line',
        data: {
            labels: Array(10).fill(''),
            datasets: [
                {
                    label: 'Trafic Entrant (KB/s)',
                    data: Array(10).fill(0),
                    borderColor: '#43a047',
                    backgroundColor: 'rgba(67, 160, 71, 0.2)',
                    borderWidth: 2,
                    tension: 0.2,
                    fill: true,
                    pointBackgroundColor: '#43a047',
                    pointRadius: 2
                },
                {
                    label: 'Trafic Sortant (KB/s)',
                    data: Array(10).fill(0),
                    borderColor: '#e53935',
                    backgroundColor: 'rgba(229, 57, 53, 0.2)',
                    borderWidth: 2,
                    tension: 0.2,
                    fill: true,
                    pointBackgroundColor: '#e53935',
                    pointRadius: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // Désactiver l'animation pour un rendu plus fluide
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + ' KB/s';
                        }
                    }
                }
            }
        }
    };
    
    // Création du graphique
    window.networkChart = new Chart(networkChartCtx, chartConfig);
    window.networkInData = Array(10).fill(0);
    window.networkOutData = Array(10).fill(0);
    console.log("Network chart initialized");
}

/**
 * Mise à jour des données du graphique réseau
 */
function updateNetworkChart(chart, incoming, outgoing) {
    if (!chart || !chart.data) {
        console.error("Network chart not properly initialized");
        return;
    }
    
    // Déplacement fiable des données - ajouter à droite, supprimer à gauche
    chart.data.datasets[0].data.push(incoming);
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.push(outgoing);
    chart.data.datasets[1].data.shift();
    
    // Mise à jour sans animation
    chart.update('none');
}

/**
 * Démarrer la simulation des données de ressources
 */
function startSimulation() {
    // Vérifier si nous avons déjà des mises à jour en temps réel
    const cpuValue = document.getElementById('cpuUsage').textContent;
    const ramValue = document.getElementById('ramUsage').textContent;
    
    // Si les valeurs sont toujours à 0%, démarrer la simulation
    if (cpuValue === "0%" && ramValue === "0%") {
        let simulationCount = 0;
        const simulationTimeout = simulateResourceData();
        
        // Arrêter la simulation après un certain temps ou si des données réelles arrivent
        const checkRealData = setInterval(() => {
            simulationCount++;
            const cpuCurrent = document.getElementById('cpuUsage').textContent;
            
            // Si nous recevons des données réelles ou après 10 tentatives, arrêter la simulation
            if ((cpuCurrent !== "0%" && !cpuCurrent.includes('undefined')) || simulationCount > 10) {
                clearTimeout(simulationTimeout);
                clearInterval(checkRealData);
                console.log("Passage aux données réelles");
            }
        }, 3000);
    }
}

/**
 * Simuler les données de ressources pour la démo
 */
function simulateResourceData() {
    // Simuler de nouvelles valeurs
    const newCpuValue = Math.floor(Math.random() * 30) + 20; // Entre 20-50%
    const newRamValue = Math.floor(Math.random() * 40) + 30; // Entre 30-70%
    
    // Mettre à jour les graphiques
    updateChartData(window.cpuData, window.cpuChart, newCpuValue);
    updateChartData(window.ramData, window.ramChart, newRamValue);
    
    // Mettre à jour les textes
    const cpuElement = document.getElementById('cpuUsage');
    const ramElement = document.getElementById('ramUsage');
    
    if (cpuElement) cpuElement.textContent = `${newCpuValue}%`;
    if (ramElement) ramElement.textContent = `${newRamValue}%`;
    
    // Appeler cette fonction à nouveau après un délai
    return setTimeout(simulateResourceData, 3000);
}

/**
 * Simuler des données réseau pour la démo
 */
function simulateNetworkData() {
    if (!window.networkInData || !window.networkOutData) return;
    
    const inValue = Math.floor(Math.random() * 500) + 50; // Entre 50KB et 550KB
    const outValue = Math.floor(Math.random() * 200) + 30; // Entre 30KB et 230KB
    
    const networkInElement = document.getElementById("networkIn");
    const networkOutElement = document.getElementById("networkOut");
    
    // Mettre à jour les graphiques
    if (window.networkInChart && window.networkInData) {
        updateChartData(window.networkInData, window.networkInChart, inValue);
    }
    
    if (window.networkOutChart && window.networkOutData) {
        updateChartData(window.networkOutData, window.networkOutChart, outValue);
    }
    
    // Mettre à jour les textes
    if (networkInElement) networkInElement.textContent = formatNetworkSpeed(inValue * 1024);
    if (networkOutElement) networkOutElement.textContent = formatNetworkSpeed(outValue * 1024);
}

/**
 * Mise à jour des données des graphiques
 */
function updateChartData(dataArray, chart, newValue) {
    // Utiliser une approche simple et fiable: ajouter à droite, supprimer à gauche
    dataArray.push(parseFloat(newValue));
    dataArray.shift();
    
    // Mettre à jour simplement les données du graphique
    chart.data.datasets[0].data = [...dataArray];
    
    // Mise à jour du graphique sans animation pour un déplacement fluide
    chart.update('none');
    
    // Force a resize after update to ensure visibility
    setTimeout(() => {
        if (chart && typeof chart.resize === 'function') {
            chart.resize();
        }
    }, 50);
}

/**
 * Mise à jour des couleurs des graphiques lors du changement de thème
 */
window.updateChartsTheme = function() {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    // Couleurs communes basées sur le thème
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
    const legendColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    
    // Mise à jour de tous les graphiques
    const allCharts = [window.cpuChart, window.ramChart, window.networkChart];
    
    allCharts.forEach(chart => {
        if (chart) {
            // Mise à jour des couleurs de la grille
            chart.options.scales.y.grid.color = gridColor;
            
            // Mise à jour des couleurs du texte
            chart.options.scales.y.ticks.color = textColor;
            
            // Mise à jour des légendes
            if (chart.options.plugins.legend.display) {
                chart.options.plugins.legend.labels.color = legendColor;
            }
            
            chart.update();
        }
    });
};

// ==== UTILITAIRES ====

/**
 * Formatage des octets en unités lisibles (Ko, Mo, Go)
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formatage de la vitesse réseau
 */
function formatNetworkSpeed(bytesPerSec) {
    if (bytesPerSec < 1024) {
        return bytesPerSec.toFixed(0) + ' B/s';
    } else if (bytesPerSec < 1024 * 1024) {
        return (bytesPerSec / 1024).toFixed(1) + ' KB/s';
    } else {
        return (bytesPerSec / (1024 * 1024)).toFixed(2) + ' MB/s';
    }
}

/**
 * Formatage du temps d'activité
 * Modifié pour accepter à la fois les secondes et les chaînes formatées
 */
function formatUptime(uptime) {
    // Si c'est déjà une chaîne formatée, la retourner
    if (typeof uptime === 'string') {
        return uptime;
    }
    
    // Sinon, formatter les secondes
    if (typeof uptime !== 'number') return 'N/A';
    
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    if (days > 0) {
        return `${days}j ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// ==== GESTION DES FICHIERS ====

/**
 * Upload d'un fichier au serveur
 */
function uploadFile() {
    let file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Sélectionne un fichier");

    // Créer un div d'état de chargement
    const uploadStatus = document.createElement('div');
    uploadStatus.className = 'upload-status';
    uploadStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    
    const fileUpload = document.querySelector('.file-upload');
    fileUpload.appendChild(uploadStatus);

    let formData = new FormData();
    formData.append("file", file);

    fetch("/upload", { method: "POST", body: formData })
        .then(response => response.text())
        .then(data => {
            uploadStatus.innerHTML = `<i class="fas fa-check-circle"></i> ${data}`;
            uploadStatus.className = 'upload-status success';
            setTimeout(() => uploadStatus.remove(), 3000);
        })
        .catch(error => {
            console.error("Erreur:", error);
            uploadStatus.innerHTML = `<i class="fas fa-times-circle"></i> Erreur: ${error.message}`;
            uploadStatus.className = 'upload-status error';
            setTimeout(() => uploadStatus.remove(), 5000);
        });
}

// ==== STATUT DU SERVEUR ====

/**
 * Mise à jour du statut du serveur
 */
function updateServerStatus(isOnline) {
    const statusElement = document.getElementById('serverStatus');
    if (statusElement) {
        if (isOnline) {
            statusElement.textContent = 'Online';
            statusElement.className = 'server-status status-online';
        } else {
            statusElement.textContent = 'Offline';
            statusElement.className = 'server-status status-offline';
        }
    }
}

// Socket pour le statut du serveur
window.socket.on("serverStatus", (status) => {
    updateServerStatus(status === 'online');
});
