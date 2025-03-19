#!/bin/bash

# Couleurs ANSI
brown='\033[38;5;94m'   # Marron pour la terre
green='\033[38;5;28m'   # Vert pour l'herbe
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
reset='\033[0m'         # Reset couleur

clear

# Affichage du logo
echo -e "               ${green}╭------------╮"
echo -e "               |############|"
echo -e "               |------------|"
echo -e "               ${brown}|############|"
echo -e "               |#${reset}Mineserver${reset}${brown}#|"
echo -e "               |############|"
echo -e "               ╰------------╯ ${reset}"
echo

# Affichage du message
echo -e " ${BLUE}============================================= ${reset}"
echo -e "           ${green}Bienvenue sur MineServer ! ${reset}"
echo -e " ${BLUE}============================================= ${reset}"
echo
echo "Votre serveur Minecraft à portée de main !"
echo "Configurez-le facilement en quelques étapes."

# Menu principal
echo -e "${BLUE}============================================= ${reset}"
echo -e "                    ${green}Menu${reset}"
echo -e "${BLUE}============================================= ${reset}"
echo "1) Démarrer le serveur"
echo "2) Configuration"
echo "3) Je ne sais pas"
echo -e "Choisissez une option (1, 2, ou 3): "
read -r option

case $option in
    1)
        echo "Démarrage du serveur..."
        # Ajouter la commande pour démarrer le serveur ici
        ;;
    2)
        echo "Configuration du serveur..."
        # Exécution du script de configuration
        ./configuration.sh  # Appel du script config.sh
        ;;
    3)
        echo "Vous avez choisi l'option 'Je ne sais pas'."
        echo "Veuillez consulter la documentation pour plus d'informations."
        ;;
    *)
        echo "Option invalide. Veuillez choisir 1, 2 ou 3."
        ;;
esac
