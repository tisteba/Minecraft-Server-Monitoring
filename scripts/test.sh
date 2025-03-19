#!/bin/bash

# Couleurs ANSI
brown='\033[38;5;94m' 
green='\033[38;5;28m'   
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
reset='\033[0m'         

clear

display_logo() {
    echo -e "               ${green}╭------------╮"
    echo -e "               |############|"
    echo -e "               |------------|"
    echo -e "               ${brown}|############|"
    echo -e "               |#${reset}Mineserver${reset}${brown}#|"
    echo -e "               |############|"
    echo -e "               ╰------------╯ ${reset}"
    echo
}

display_welcome_message() {
    echo -e " ${BLUE}============================================= ${reset}"
    echo -e "           ${green}Bienvenue sur MineServer ! ${reset}"
    echo -e " ${BLUE}============================================= ${reset}"
    echo
    echo "Votre serveur Minecraft à portée de main !"
    echo "Configurez-le facilement en quelques étapes."
    echo    ""
}

handle_menu() {
    echo -e "${BLUE}============================================= ${reset}"
    echo -e "                    ${green}Menu${reset}"
    echo -e "${BLUE}============================================= ${reset}"
    echo    ""
    echo -e "1) Installe le serveur          2) Démarrer le serveur"
    echo -e "3) Configuration                4) Je ne sais pas"
    echo    ""
    echo -e "${BLUE}============================================= ${reset}"
    echo    ""
    echo -e "Choisissez une option : "
    read -r option

    case "$option" in
        1) install_server ;;
        2) start_server ;; 
        3) configure_server ;; 
        4) echo "Je ne sais pas encore quoi faire." ;;
        *) echo -e "${RED}Option invalide. Veuillez choisir une option valide.${reset}" ;;
    esac
}

# Fonction de demarrage du serveur
start_server() {
    echo "Démarrage du serveur..."
}

# Fonction de configuration du serveur
configure_server() {
}

# Fonction pour installé le server
install_server() {
}

display_logo
display_welcome_message

installation_flag="server_installed.flag"

if [ ! -f "$installation_flag" ]; then
    echo -e "${RED}Le serveur n'est pas encore installé.${reset}"
    handle_menu
else
    echo -e "${green}Le serveur est déjà installé.${reset}"
    handle_menu
fi
