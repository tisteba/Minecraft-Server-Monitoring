function startServer() {
    const statusContainer = document.getElementById('serverStatus');
    const button = document.getElementById('serverButton');
    
    if (statusContainer.innerText === "Server is OFF") {
        fetch('/startserver')
            .then(response => response.text())
            .then(data => {
                statusContainer.innerText = "Server is ON";
                statusContainer.classList.remove('has-text-danger');
                statusContainer.classList.add('has-text-success');
                button.innerText = "Stop Server";
                button.classList.remove('is-primary');
                button.classList.add('is-danger');
            })
            .catch(error => console.error('Erreur:', error));
    } else if (statusContainer.innerText === "Server is ON") {
        fetch('/stopserver')
            .then(response => response.text())
            .then(data => {
                statusContainer.innerText = "Server is OFF";
                statusContainer.classList.remove('has-text-success');
                statusContainer.classList.add('has-text-danger');
                button.innerText = "Start Server";
                button.classList.remove('is-danger');
                button.classList.add('is-success');
            })
            .catch(error => console.error('Erreur:', error));
    }
}
