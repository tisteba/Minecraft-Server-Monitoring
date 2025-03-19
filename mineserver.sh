#!/bin/bash

# Couleurs ANSI
brown='\033[38;5;94m'
green='\033[38;5;28m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'  # No Color

clear 

# Fonction pour afficher le logo
display_logo() {
    echo -e "               ${green}╭------------╮"
    echo -e "               |############|"
    echo -e "               |------------|"
    echo -e "               ${brown}|############|"
    echo -e "               |#${NC}Mineserver${NC}${brown}#|"
    echo -e "               |############|"
    echo -e "               ╰------------╯ ${NC}"
    echo
}

# Fonction pour afficher le message de bienvenue
display_welcome_message() {
    echo -e " ${BLUE}============================================= ${NC}"
    echo -e "           ${green}Bienvenue sur MineServer ! ${NC}"
    echo -e " ${BLUE}============================================= ${NC}"
    echo
    echo "Votre serveur Minecraft à portée de main !"
    echo "Configurez-le facilement en quelques étapes."
    echo ""
}

# Fonction pour gérer le menu principal
handle_menu() {
    echo -e "${BLUE}============================================= ${NC}"
    echo -e "                    ${green}Menu${NC}"
    echo -e "${BLUE}============================================= ${NC}"
    echo ""
    echo -e "1) Installer le serveur          2) Démarrer le serveur"
    echo -e "3) Configuration                 4) Je ne sais pas"
    echo ""
    echo -e "${BLUE}============================================= ${NC}"
    echo ""
    echo -e "Choisissez une option : "
    read -r option

    case "$option" in
        1) install_server ;;
        2) start_server ;;
        3) configure_server ;;
        4) echo "Je ne sais pas encore quoi faire." ;;
        *) echo -e "${RED}Option invalide. Veuillez choisir une option valide.${NC}" ;;
    esac
}

# Fonction pour démarrer le serveur
start_server() {
    echo "Démarrage du serveur..."
}

# Fonction pour configurer le serveur
configure_server() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${GREEN}Choisissez une option de configuration :${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo    ""
    echo -e "1. Configuration Simple"
    echo    ""
    echo -e "2. Configuration Avancée"
    echo    ""
    echo -e "${BLUE}======================================${NC}"
    echo    ""
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
}

# Fonction pour la configuration simple
simple_config() {
    SERVER_PROPERTIES_FILE="./bedrock-server/server.properties"

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
#Enlevé les commentaire pour que ce sois plus lisible 
advanced_config() {
    SERVER_PROPERTIES_FILE="./bedrock-server/server.properties"

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

# Fonction pour afficher un résumé des modifications
summary() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "     ${GREEN}Résumé des modifications :${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo    ""
    echo -e "Nom du serveur: ${YELLOW}$server_name${NC}"
    echo    ""
    echo -e "Port IPv4: ${YELLOW}$server_port${NC}"
    echo    ""
    echo -e "Port IPv6: ${YELLOW}$server_portv6${NC}"
    echo    ""
    echo -e "Mode de jeu: ${YELLOW}$gamemode${NC}"
    echo    ""
    echo -e "Difficulté: ${YELLOW}$difficulty${NC}"
    echo    ""
    echo -e "Nombre maximum de joueurs: ${YELLOW}$max_players${NC}"
    echo    ""
    echo -e "Mode en ligne: ${YELLOW}$online_mode${NC}"
    echo    ""
    echo -e "Cheats autorisés: ${YELLOW}$allow_cheats${NC}"    
    echo    ""
    echo -e "${BLUE}======================================${NC}"
    echo    ""
}

# Fonction pour installer le serveur
install_server() {
    folder_name="bedrock-server"
    installation_flag="server_installed.flag"

    if [ ! -f "$installation_flag" ]; then
        echo "Création du dossier $folder_name..."
        mkdir -p "$folder_name"

        if [ ! -f "bedrock-server-1.21.62.01.zip" ]; then
            echo "Le fichier ZIP du serveur est manquant. Assurez-vous qu'il soit dans le même répertoire."
            return 1
        fi

        echo "Vérification de l'intégrité du fichier ZIP..."
        if ! unzip -t bedrock-server-1.21.62.01.zip > /dev/null; then
            echo "Erreur : Le fichier ZIP est corrompu ou invalide."
            return 1
        fi

        echo "Récupération de la taille du fichier ZIP..."
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            total_size=$(stat -c%s bedrock-server-1.21.62.01.zip)
        elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* ]]; then
            total_size=$(wc -c < bedrock-server-1.21.62.01.zip)
        else
            echo "Erreur : Système d'exploitation non supporté."
            return 1
        fi

        if [ -z "$total_size" ] || [ "$total_size" -eq 0 ]; then
            echo "Erreur : La taille du fichier ZIP est invalide."
            return 1
        fi

        echo "Décompression en cours dans le dossier $folder_name..."
        unzip -q bedrock-server-1.21.62.01.zip -d "$folder_name" &
        unzip_pid=$!

        spinner=('/' '-' '\\' '|')
        spinner_index=0

        while ps -p $unzip_pid > /dev/null; do
            extracted_size=$(du -s "$folder_name" | awk '{print $1}')
            progress=$((100 * extracted_size / total_size))
            spinner_char=${spinner[$spinner_index]}

            printf "\r%s %d%%" "$spinner_char" "$progress"
            spinner_index=$(( (spinner_index + 1) % 4 ))

            sleep 0.2
        done

        wait $unzip_pid
        unzip_status=$?

        if [ $unzip_status -ne 0 ]; then
            echo -e "\nErreur lors de la décompression du fichier ZIP."
            return 1
        fi

        echo -e "\nExtraction terminée."
        touch "$installation_flag"

        if [ -d "./$folder_name" ]; then
            cd ./$folder_name || exit 1
        else
            echo "Le répertoire $folder_name n'existe pas."
            return 1
        fi

        echo "Installation réussie. Vous pouvez maintenant configurer le serveur."
    else
        echo "Le serveur est déjà installé."
    fi
}

# Fonction principale pour exécuter le script
run_script() {
    display_logo
    display_welcome_message

    installation_flag="server_installed.flag"

    if [ ! -f "$installation_flag" ]; then
        echo -e "${RED}Le serveur n'est pas encore installé.${NC}"
        handle_menu
    else
        echo -e "${green}Le serveur est déjà installé.${NC}"
        handle_menu
    fi
}

# Exécution du script
run_script