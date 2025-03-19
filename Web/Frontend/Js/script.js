document.getElementById('start-btn').addEventListener('click', () => {
    fetch('/startserver')
        .then(response => response.text())
        .then(message => alert(message));
});

document.getElementById('stop-btn').addEventListener('click', () => {
    fetch('/stopserver')
        .then(response => response.text())
        .then(message => alert(message));
});

document.getElementById('restart-btn').addEventListener('click', () => {
    fetch('/restartserver')
        .then(response => response.text())
        .then(message => alert(message));
});

// Connexion WebSocket pour récupérer les statistiques du serveur
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.cpu) {
        document.getElementById('cpu').textContent = `CPU Usage: ${data.cpu}`;
    }
    if (data.ram) {
        document.getElementById('ram').textContent = `RAM Usage: ${data.ram}`;
    }
    if (data.disk) {
        document.getElementById('disk').textContent = `Disk Usage: ${data.disk}`;
    }
};
