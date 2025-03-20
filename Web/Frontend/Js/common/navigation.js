/**
 * Gestion de la navigation et du menu
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation du menu
    if (document.getElementById('menuToggle')) {
        document.getElementById('menuToggle').addEventListener('click', toggleMenu);
    }
    
    if (document.getElementById('menuClose')) {
        document.getElementById('menuClose').addEventListener('click', toggleMenu);
    }
    
    if (document.getElementById('overlay')) {
        document.getElementById('overlay').addEventListener('click', toggleMenu);
    }
    
    // Marquer le lien actif dans le menu
    markActiveMenuLink();
});

/**
 * Ouvre et ferme le menu latéral
 */
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    
    if (menu && overlay) {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Empêcher le défilement quand le menu est ouvert
        document.body.classList.toggle('menu-open');
    }
}

/**
 * Marque le lien de menu actif en fonction de l'URL courante
 */
function markActiveMenuLink() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.menu-items a');
    
    menuLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Si le lien correspond à la page courante ou est l'index sur la page d'accueil
        if (linkPath === currentPath || 
            (currentPath.endsWith('/') && linkPath === 'index.html') ||
            (currentPath.endsWith('index.html') && linkPath === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
