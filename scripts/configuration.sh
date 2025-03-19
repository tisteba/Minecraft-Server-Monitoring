#!/bin/bash

SERVER_PROPERTIES_FILE="server.properties"

# Couleurs pour le texte
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' 

# Fonction pour afficher un résumé des modifications
summary() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${GREEN}Résumé des modifications :${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo -e "Nom du serveur: ${YELLOW}$server_name${NC}"
    echo -e "Port IPv4: ${YELLOW}$server_port${NC}"
    echo -e "Port IPv6: ${YELLOW}$server_portv6${NC}"
    echo -e "Mode de jeu: ${YELLOW}$gamemode${NC}"
    echo -e "Difficulté: ${YELLOW}$difficulty${NC}"
    echo -e "Nombre maximum de joueurs: ${YELLOW}$max_players${NC}"
    echo -e "Mode en ligne: ${YELLOW}$online_mode${NC}"
    echo -e "Cheats autorisés: ${YELLOW}$allow_cheats${NC}"
    echo -e "${BLUE}======================================${NC}"
}

# Fonction pour la configuration simple
simple_config() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "         ${GREEN}Configuration Simple${NC}"
    echo -e "${BLUE}======================================${NC}"

    # Nom du serveur
    echo -e "\n${BLUE}Nom du serveur${NC}"
    echo -e "Appuyez sur Entrée pour utiliser la valeur par défaut '${YELLOW}Dedicated Server${NC}'."
    read -p "> " server_name
    server_name=${server_name:-"Dedicated Server"}

    # Port du serveur IPv4
    echo -e "\n${BLUE}Port du serveur IPv4${NC}"
    echo -e "Appuyez sur Entrée pour utiliser la valeur par défaut '${YELLOW}19132${NC}'."
    read -p "> " server_port
    server_port=${server_port:-19132}

    # Port du serveur IPv6
    echo -e "\n${BLUE}Port du serveur IPv6${NC}"
    echo -e "Appuyez sur Entrée pour utiliser la valeur par défaut '${YELLOW}19133${NC}'."
    read -p "> " server_portv6
    server_portv6=${server_portv6:-19133}

    # Mode de jeu
    echo -e "\n${BLUE}Mode de jeu${NC}"
    echo -e "Choix possibles : ${YELLOW}survival${NC}, ${YELLOW}creative${NC}, ${YELLOW}adventure${NC}."
    echo -e "Appuyez sur Entrée pour utiliser la valeur par défaut '${YELLOW}survival${NC}'."
    read -p "> " gamemode
    gamemode=${gamemode:-survival}

    # Difficulté
    echo -e "\n${BLUE}Difficulté${NC}"
    echo -e "Choix possibles : ${YELLOW}peaceful${NC}, ${YELLOW}easy${NC}, ${YELLOW}normal${NC}, ${YELLOW}hard${NC}."
    echo -e "Appuyez sur Entrée pour utiliser la valeur par défaut '${YELLOW}easy${NC}'."
    read -p "> " difficulty
    difficulty=${difficulty:-easy}

    # Nombre maximum de joueurs
    echo -e "\n${BLUE}Nombre maximum de joueurs${NC}"
    echo -e "Appuyez sur Entrée pour utiliser la valeur par défaut '${YELLOW}10${NC}'."
    read -p "> " max_players
    max_players=${max_players:-10}

    # Mode en ligne
    echo -e "\n${BLUE}Mode en ligne${NC}"
    echo -e "Choix possibles : ${YELLOW}true${NC}, ${YELLOW}false${NC}."
    echo -e "Appuyez sur Entrée pour utiliser la valeur par défaut '${YELLOW}true${NC}'."
    read -p "> " online_mode
    online_mode=${online_mode:-true}

    # Cheats autorisés
    echo -e "\n${BLUE}Cheats autorisés${NC}"
    echo -e "Choix possibles : ${YELLOW}true${NC}, ${YELLOW}false${NC}."
    echo -e "Appuyez sur Entrée pour utiliser la valeur par défaut '${YELLOW}true${NC}'."
    read -p "> " allow_cheats
    allow_cheats=${allow_cheats:-true}

    # Afficher le résumé des modifications
    summary

    # Demander confirmation avant d'appliquer les modifications
    echo -e "\n${RED}Voulez-vous appliquer ces modifications ? (oui/non)${NC}"
    read -p "> " confirm
    if [[ $confirm == "oui" ]]; then
        sed -i "s/^server-name=.*/server-name=$server_name/" $SERVER_PROPERTIES_FILE
        sed -i "s/^server-port=.*/server-port=$server_port/" $SERVER_PROPERTIES_FILE
        sed -i "s/^server-portv6=.*/server-portv6=$server_portv6/" $SERVER_PROPERTIES_FILE
        sed -i "s/^gamemode=.*/gamemode=$gamemode/" $SERVER_PROPERTIES_FILE
        sed -i "s/^difficulty=.*/difficulty=$difficulty/" $SERVER_PROPERTIES_FILE
        sed -i "s/^max-players=.*/max-players=$max_players/" $SERVER_PROPERTIES_FILE
        sed -i "s/^online-mode=.*/online-mode=$online_mode/" $SERVER_PROPERTIES_FILE
        sed -i "s/^allow-cheats=.*/allow-cheats=$allow_cheats/" $SERVER_PROPERTIES_FILE
        echo -e "${GREEN}Modifications appliquées avec succès.${NC}"
    else
        echo -e "${RED}Modifications annulées.${NC}"
    fi
}

# Fonction pour la configuration avancée
advanced_config() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${GREEN}Configuration Avancée${NC}"
    echo -e "${BLUE}======================================${NC}"

    # Afficher les lignes actuelles du fichier
    echo -e "\n${BLUE}Voici les lignes actuelles du fichier server.properties :${NC}"
    cat -n $SERVER_PROPERTIES_FILE

    # Demander à l'utilisateur quelle ligne modifier
    echo -e "\n${BLUE}Entrez le numéro de la ligne que vous souhaitez modifier :${NC}"
    read -p "> " line_number
    echo -e "\n${BLUE}Entrez la nouvelle valeur pour cette ligne :${NC}"
    read -p "> " new_value

    # Afficher un résumé de la modification
    echo -e "${BLUE}======================================${NC}"
    echo -e "${GREEN}Résumé de la modification :${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo -e "Ligne ${YELLOW}$line_number${NC} sera modifiée en : ${YELLOW}$new_value${NC}"
    echo -e "${BLUE}======================================${NC}"

    # Demander confirmation avant d'appliquer la modification
    echo -e "\n${RED}Voulez-vous appliquer cette modification ? (oui/non)${NC}"
    read -p "> " confirm
    if [[ $confirm == "oui" ]]; then
        sed -i "${line_number}s/.*/$new_value/" $SERVER_PROPERTIES_FILE
        echo -e "${GREEN}Ligne $line_number modifiée avec succès.${NC}"
    else
        echo -e "${RED}Modification annulée.${NC}"
    fi
}

# Menu principal
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Choisissez une option de configuration :${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "1. Configuration Simple"
echo -e "2. Configuration Avancée"
echo -e "${BLUE}======================================${NC}"
read -p "Entrez le numéro de l'option (1 ou 2) : " choice

case $choice in
    1)
        simple_config
        ;;
    2)
        advanced_config
        ;;
    *)
        echo -e "${RED}Option invalide. Veuillez choisir 1 ou 2.${NC}"
        ;;
esac
