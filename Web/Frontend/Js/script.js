const socket = io();

// Terminal interactif
document.getElementById("command").addEventListener("keypress", (event) => {
    if (event.key === "Enter") sendCommand();
});

function sendCommand() {
    let command = document.getElementById("command").value;
    socket.emit("terminalInput", command);
    document.getElementById("command").value = "";
}

socket.on("terminalOutput", (data) => {
    let terminal = document.getElementById("terminal-container");
    terminal.innerHTML += `<div>${data}</div>`;
    terminal.scrollTop = terminal.scrollHeight;
});

// Contrôle du serveur
function serverAction(action) {
    socket.emit("serverControl", action);
}

socket.on("serverMessage", (message) => alert(message));

// Utilisation CPU/RAM
socket.on("cpuUsage", (usage) => document.getElementById("cpuUsage").innerText = usage.toFixed(2) + "%");
socket.on("ramUsage", (usage) => document.getElementById("ramUsage").innerText = usage.toFixed(2) + "%");

// Gestion des fichiers
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
