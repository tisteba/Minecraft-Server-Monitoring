/**
 * Fonctionnalités du tableau de bord
 */

// Connexion socket.io
const socket = io();

// Initialisation globale
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation de la console
    initializeTerminal();
    
    // Initialisation des graphiques
    if (document.getElementById('cpuChart') && document.getElementById('ramChart')) {
        initializeCharts();
    }
});

// ==== TERMINAL ET COMMANDES ====

/**
 * Initialisation du terminal
 */
function initializeTerminal() {
    const commandInput = document.getElementById("command");
    if (commandInput) {
        commandInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") sendCommand();
        });
    }
    
    // Écouteur pour les sorties du terminal
    socket.on("terminalOutput", (data) => {
        let terminal = document.getElementById("terminal-container");
        if (terminal) {
            terminal.innerHTML += `<div>${data}</div>`;
            terminal.scrollTop = terminal.scrollHeight;
        }
    });
}

/**
 * Envoie une commande au serveur
 */
function sendCommand() {
    let command = document.getElementById("command").value;
    socket.emit("terminalInput", command);
    document.getElementById("command").value = "";
}

/**
 * Contrôle du serveur (démarrer, arrêter, redémarrer)
 */
function serverAction(action) {
    socket.emit("serverControl", action);
}

// Écouteur pour les messages du serveur
socket.on("serverMessage", (message) => alert(message));

// ==== SURVEILLANCE DES RESSOURCES ====

/**
 * Utilisation CPU en temps réel
 */
socket.on("cpuUsage", (usage) => {
    const cpuValue = usage.toFixed(2);
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
socket.on("ramUsage", (usage) => {
    const ramValue = usage.toFixed(2);
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
 * Initialisation des graphiques
 */
function initializeCharts() {
    const cpuChartCtx = document.getElementById('cpuChart').getContext('2d');
    const ramChartCtx = document.getElementById('ramChart').getContext('2d');
    
    // Obtenir les couleurs basées sur le thème actuel
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const colors = getThemeColors(theme);
    
    // Configuration commune des graphiques
    const chartConfig = {
        type: 'line',
        data: {
            labels: Array(10).fill(''),
            datasets: [{
                data: Array(10).fill(0),
                borderColor: colors.borderColor,
                backgroundColor: colors.backgroundColor,
                borderWidth: 2,
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false,
                    min: 0,
                    max: 100
                }
            },
            animation: {
                duration: 300
            },
            elements: {
                line: {
                    tension: 0.2
                },
                point: {
                    radius: 0
                }
            }
        }
    };
    
    // Création des graphiques
    window.cpuChart = new Chart(cpuChartCtx, JSON.parse(JSON.stringify(chartConfig)));
    window.ramChart = new Chart(ramChartCtx, JSON.parse(JSON.stringify(chartConfig)));
    
    // Initialisation des données
    window.cpuData = Array(10).fill(0);
    window.ramData = Array(10).fill(0);
    
    // Démarrer la simulation si nous ne recevons pas encore de données réelles
    startSimulation();
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
        simulateResourceData();
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
    document.getElementById('cpuUsage').textContent = `${newCpuValue}%`;
    document.getElementById('ramUsage').textContent = `${newRamValue}%`;
    
    // Appeler cette fonction à nouveau après un délai
    setTimeout(simulateResourceData, 3000);
}

/**
 * Mise à jour des données des graphiques
 */
function updateChartData(dataArray, chart, newValue) {
    // Ajouter la nouvelle valeur et supprimer la plus ancienne
    dataArray.push(parseFloat(newValue));
    dataArray.shift();
    
    // Mettre à jour le graphique
    chart.data.datasets[0].data = [...dataArray];
    chart.update();
}

/**
 * Mise à jour des couleurs des graphiques lors du changement de thème
 */
window.updateChartsTheme = function() {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const colors = getThemeColors(theme);
    
    if (window.cpuChart) {
        window.cpuChart.data.datasets[0].borderColor = colors.borderColor;
        window.cpuChart.data.datasets[0].backgroundColor = colors.backgroundColor;
        window.cpuChart.update();
    }
    
    if (window.ramChart) {
        window.ramChart.data.datasets[0].borderColor = colors.borderColor;
        window.ramChart.data.datasets[0].backgroundColor = colors.backgroundColor;
        window.ramChart.update();
    }
};

// ==== GESTION DES FICHIERS ====

/**
 * Upload d'un fichier au serveur
 */
function uploadFile() {
    let file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Sélectionne un fichier");

    let formData = new FormData();
    formData.append("file", file);

    fetch("/upload", { method: "POST", body: formData })
        .then(response => response.text())
        .then(data => alert(data))
        .catch(error => console.error("Erreur:", error));
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
socket.on("serverStatus", (status) => {
    updateServerStatus(status === 'online');
});
