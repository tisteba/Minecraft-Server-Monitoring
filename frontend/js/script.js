window.onload = () => {
    fetch('http://localhost:3000/api/utilisateurs')
        .then(response => response.json())
        .then(data => {
        const usersDiv = document.getElementById('utilisateurs');
        data.forEach(user => {
            const userElement = document.createElement('div');
            userElement.textContent = `Utilisateur: ${user.name}`;
            usersDiv.appendChild(userElement);
        });
    })
    .catch(error => console.error('Erreur lors de la récupération des utilisateurs:', error));
};
