/**
 * Gestion du thème (clair/sombre)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation du toggle de thème
    if (document.getElementById('themeToggle')) {
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);
        
        // Vérifier si un thème est stocké localement
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }
    }
});

// Bascule entre les thèmes clair et sombre
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcon(newTheme);
    
    // Mettre à jour les graphiques avec les nouvelles couleurs de thème si disponibles
    if (window.updateChartsTheme) {
        window.updateChartsTheme();
    }
}

// Met à jour l'icône du bouton de thème
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }
}

// Obtient les couleurs à utiliser en fonction du thème
function getThemeColors(theme) {
    if (theme === 'dark') {
        return {
            borderColor: '#1e88e5',
            backgroundColor: 'rgba(30, 136, 229, 0.1)'
        };
    } else {
        return {
            borderColor: '#1565c0',
            backgroundColor: 'rgba(25, 118, 210, 0.05)'
        };
    }
}
