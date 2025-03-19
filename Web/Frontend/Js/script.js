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

const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = function(event) {
    const data = event.data;
    document.getElementById('stats').innerText = data;
};

document.getElementById('command-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const command = event.target.value;
        ws.send(command);
        event.target.value = '';
    }
});
