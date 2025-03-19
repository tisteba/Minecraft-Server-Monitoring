// WebSocket pour recevoir les données de la console SSH et les statistiques
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);

  if (data.type === "console") {
    // Afficher les données de la console SSH
    const sshConsole = document.getElementById('ssh-console');
    sshConsole.innerText += data.data + '\n'; // Ajoute les nouvelles données à la console
    sshConsole.scrollTop = sshConsole.scrollHeight; // Fait défiler vers le bas
  } else if (data.type === "stats") {
    // Mettre à jour les statistiques du serveur
    document.getElementById('cpu-usage').innerText = data.data.cpu + '%';
    document.getElementById('cpu-temp').innerText = data.data.temp;
    document.getElementById('ram-usage').innerText = data.data.ram + '%';
  }
};

// Envoi de commandes à la console via WebSocket
document.getElementById('command-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const command = event.target.value;
    ws.send(command);
    event.target.value = '';
  }
});

// Boutons de contrôle
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