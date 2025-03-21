#!/bin/bash

# Couleurs ANSI
brown='\033[38;5;94m'
green='\033[38;5;28m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Définir le chemin de base du projet
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$BASE_DIR/Web"
BACKEND_DIR="$WEB_DIR/Backend"
SERVER_DIR="$BASE_DIR/bedrock-server"
BACKUP_DIR="/var/backups/minecraft"

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
    echo -e "1) Menu CLI          2) Menu Web"
    echo ""
    echo -e "${BLUE}============================================= ${NC}"
    echo ""
    echo -e "Choisissez une option : "
    read -r option

    case "$option" in
        1) cli_menu ;;
        2) web_menu ;;
        *) echo -e "${RED}Option invalide. Veuillez choisir une option valide.${NC}" ;;
    esac
}

# Fonction pour le menu CLI
cli_menu() {
    echo -e "${BLUE}============================================= ${NC}"
    echo -e "                    ${green}Menu CLI${NC}"
    echo -e "${BLUE}============================================= ${NC}"
    echo ""
    echo -e "1) Installer le serveur"
    echo -e "2) Configurer le serveur"
    echo -e "3) Démarrer le serveur"
    echo -e "4) Arrêter le serveur"
    echo -e "5) Redémarrer le serveur"
    echo -e "6) Activer les sauvegardes"
    echo -e "7) Voir les sauvegardes"
    echo ""
    echo -e "${BLUE}============================================= ${NC}"
    echo ""
    echo -e "Choisissez une option : "
    read -r option

    case "$option" in
        1) install_server ;;
        2) configure_server ;;
        3) start_server ;;
        4) stop_server ;;
        5) restart_server ;;
        6) enable_backups ;;
        7) view_backups ;;
        *) echo -e "${RED}Option invalide. Veuillez choisir une option valide.${NC}" ;;
    esac
}

# Fonction pour le menu Web
web_menu() {
    echo -e "${BLUE}============================================= ${NC}"
    echo -e "                    ${green}Menu Web${NC}"
    echo -e "${BLUE}============================================= ${NC}"
    echo ""
    echo -e "1) Changer la configuration SSH"
    echo -e "2) Modifier le port du serveur web"
    echo ""
    echo -e "${BLUE}============================================= ${NC}"
    echo ""
    echo -e "Choisissez une option : "
    read -r option

    case "$option" in
        1) change_ssh_config ;;
        2) change_web_port ;;
        *) echo -e "${RED}Option invalide. Veuillez choisir une option valide.${NC}" ;;
    esac
}

# Fonction pour changer la configuration SSH
change_ssh_config() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "         ${GREEN}Changer la configuration SSH${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    read -p "Entrez l'adresse du serveur SSH : " ssh_host
    read -p "Entrez le port SSH : " ssh_port
    read -p "Entrez le nom d'utilisateur SSH : " ssh_username
    read -p "Entrez le chemin de la clé SSH : " ssh_key_path
    echo ""
    echo -e "Nouvelle configuration SSH :"
    echo -e "Host: ${YELLOW}$ssh_host${NC}"
    echo -e "Port: ${YELLOW}$ssh_port${NC}"
    echo -e "Username: ${YELLOW}$ssh_username${NC}"
    echo -e "Chemin de la clé SSH: ${YELLOW}$ssh_key_path${NC}"
    echo ""
    echo -e "${RED}Voulez-vous appliquer cette modification ? (oui/non)${NC}"
    read -p "> " confirm
    if [[ $confirm == "oui" ]]; then
        sed -i "s|host: \".*\"|host: \"$ssh_host\"|" "$BACKEND_DIR/server.js"
        sed -i "s|port: .*|port: $ssh_port|" "$BACKEND_DIR/server.js"
        sed -i "s|username: \".*\"|username: \"$ssh_username\"|" "$BACKEND_DIR/server.js"
        sed -i "s|privateKey: fs.readFileSync(\".*\"|privateKey: fs.readFileSync(\"$ssh_key_path\"|" "$BACKEND_DIR/server.js"
        echo -e "${GREEN}Modification appliquée avec succès.${NC}"
    else
        echo -e "${RED}Modification annulée.${NC}"
    fi
}

# Fonction pour modifier le port du serveur web
change_web_port() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "         ${GREEN}Modifier le port du serveur web${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    read -p "Entrez le nouveau port : " web_port
    echo ""
    echo -e "Nouveau port du serveur web : ${YELLOW}$web_port${NC}"
    echo ""
    echo -e "${RED}Voulez-vous appliquer cette modification ? (oui/non)${NC}"
    read -p "> " confirm
    if [[ $confirm == "oui" ]]; then
        sed -i "s|server.listen(.*)|server.listen($web_port, () => console.log(\"Serveur lancé sur http://localhost:$web_port\"));|" "$BACKEND_DIR/server.js"
        echo -e "${GREEN}Modification appliquée avec succès.${NC}"
    else
        echo -e "${RED}Modification annulée.${NC}"
    fi
}

# Fonction pour vérifier le statut du serveur Minecraft
checkMinecraftStatus() {
    if [ ! -f "$SERVER_DIR/bedrock_server" ]; then
        echo -e "${RED}Serveur Minecraft non installé.${NC}"
        return 1
    fi
    
    if pgrep -f bedrock_server > /dev/null; then
        echo -e "${GREEN}Statut: Le serveur Minecraft est en cours d'exécution.${NC}"
        return 0
    else
        echo -e "${RED}Statut: Le serveur Minecraft est arrêté.${NC}"
        return 1
    fi
}

# Fonction pour démarrer le serveur
start_server() {
    echo -e "${GREEN}Démarrage du serveur Minecraft...${NC}"
    SERVER_DIR="/home/serveur-minecraft/MinecraftServer"  
    LOG_DIR="$SERVER_DIR/logs"
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
    LOG_FILE="$LOG_DIR/mcbedrock_$TIMESTAMP.log"
    ARCHIVE_DAYS=7  
    ARCHIVE_FILE="$LOG_DIR/archive_$(date +"%Y-%m-%d").tar.gz"

    mkdir -p "$LOG_DIR"

    cd "$SERVER_DIR" || exit
    ./bedrock_server 2>&1 | tee -a "$LOG_FILE"

    find "$LOG_DIR" -name "mcbedrock_*.log" -type f -mtime +$ARCHIVE_DAYS -exec tar -rvf "$ARCHIVE_FILE" {} \; -exec rm {} \;

    find "$LOG_DIR" -name "archive_*.tar.gz" -type f -mtime +30 -delete
}

# Fonction pour arrêter le serveur
stop_server() {
    echo -e "${RED}Arrêt du serveur Minecraft...${NC}"
    pkill -f bedrock_server
    echo -e "${RED}Serveur arrêté.${NC}"
}

# Fonction pour redémarrer le serveur
restart_server() {
    echo -e "${YELLOW}Redémarrage du serveur Minecraft...${NC}"
    stop_server
    start_server
    echo -e "${YELLOW}Serveur redémarré.${NC}"
}

# Fonction pour activer les sauvegardes
enable_backups() {
    echo -e "${GREEN}Activation des sauvegardes automatiques...${NC}"
    
    # Créer le répertoire de sauvegarde s'il n'existe pas
    if [ ! -d "$BACKUP_DIR" ]; then
        sudo mkdir -p "$BACKUP_DIR"
        sudo chmod 755 "$BACKUP_DIR"
    fi
    
    # Créer un script de sauvegarde si nécessaire
    BACKUP_SCRIPT="$BASE_DIR/backupScript.sh"
    if [ ! -f "$BACKUP_SCRIPT" ]; then
        echo "#!/bin/bash" > "$BACKUP_SCRIPT"
        echo "DATE=\$(date +%Y-%m-%d_%H-%M-%S)" >> "$BACKUP_SCRIPT"
        echo "cd $SERVER_DIR" >> "$BACKUP_SCRIPT"
        echo "tar -czf $BACKUP_DIR/minecraft_backup_\$DATE.tar.gz worlds" >> "$BACKUP_SCRIPT"
        echo "find $BACKUP_DIR -name \"minecraft_backup_*.tar.gz\" -mtime +7 -delete" >> "$BACKUP_SCRIPT"
        chmod +x "$BACKUP_SCRIPT"
    fi
    
    (crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_SCRIPT") | crontab -
    echo -e "${GREEN}Sauvegardes automatiques activées. Une sauvegarde sera effectuée chaque jour à 2h du matin.${NC}"
}

# Fonction pour voir les sauvegardes
view_backups() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "         ${GREEN}Liste des sauvegardes${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${RED}Aucune sauvegarde trouvée. Activez d'abord les sauvegardes.${NC}"
        return
    fi
    
    ls -lh "$BACKUP_DIR" | grep minecraft_backup
    
    echo ""
    echo -e "Emplacement des sauvegardes: ${YELLOW}$BACKUP_DIR${NC}"
    echo ""
}

# Fonction pour la configuration simple
simple_config() {
    SERVER_PROPERTIES_FILE="$SERVER_DIR/server.properties"
    
    # Vérifier si le fichier existe
    if [ ! -f "$SERVER_PROPERTIES_FILE" ]; then
        echo -e "${RED}Erreur: Fichier server.properties introuvable. Veuillez d'abord installer le serveur.${NC}"
        return 1
    fi

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
    SERVER_PROPERTIES_FILE="$SERVER_DIR/server.properties"
    
    # Vérifier si le fichier existe
    if [ ! -f "$SERVER_PROPERTIES_FILE" ]; then
        echo -e "${RED}Erreur: Fichier server.properties introuvable. Veuillez d'abord installer le serveur.${NC}"
        return 1
    fi

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

# Fonction pour la configuration du serveur
configure_server() {
    echo -e "${BLUE}============================================= ${NC}"
    echo -e "                ${green}Configuration du serveur${NC}"
    echo -e "${BLUE}============================================= ${NC}"
    echo ""
    echo -e "1) Configuration simple"
    echo -e "2) Configuration avancée"
    echo ""
    echo -e "${BLUE}============================================= ${NC}"
    echo ""
    echo -e "Choisissez une option : "
    read -r option

    case "$option" in
        1) simple_config ;;
        2) advanced_config ;;
        *) echo -e "${RED}Option invalide. Veuillez choisir une option valide.${NC}" ;;
    esac
}

# Fonction principale pour exécuter le script
run_script() {
    display_logo
    display_welcome_message
    handle_menu
}

# Exécution du script
run_script