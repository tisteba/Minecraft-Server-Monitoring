#!/bin/bash

SERVER_PROPERTIES_FILE="server.properties"

# Fonction pour la configuration simple
simple_config() {
    echo "Configuration Simple"
    echo "======================"

    # Nom du serveur
    read -p "Nom du serveur (Appuyez sur Entrée pour utiliser la valeur par défaut 'Dedicated Server'): " server_name
    server_name=${server_name:-"Dedicated Server"}
    sed -i "s/^server-name=.*/server-name=$server_name/" $SERVER_PROPERTIES_FILE

    # Port du serveur
    read -p "Port du serveur IPv4 (Appuyez sur Entrée pour utiliser la valeur par défaut '19132'): " server_port
    server_port=${server_port:-19132}
    sed -i "s/^server-port=.*/server-port=$server_port/" $SERVER_PROPERTIES_FILE

    read -p "Port du serveur IPv6 (Appuyez sur Entrée pour utiliser la valeur par défaut '19133'): " server_portv6
    server_portv6=${server_portv6:-19133}
    sed -i "s/^server-portv6=.*/server-portv6=$server_portv6/" $SERVER_PROPERTIES_FILE

    # Mode de jeu
    read -p "Mode de jeu (survival, creative, adventure) (Appuyez sur Entrée pour utiliser la valeur par défaut 'survival'): " gamemode
    gamemode=${gamemode:-survival}
    sed -i "s/^gamemode=.*/gamemode=$gamemode/" $SERVER_PROPERTIES_FILE

    # Difficulté
    read -p "Difficulté (peaceful, easy, normal, hard) (Appuyez sur Entrée pour utiliser la valeur par défaut 'easy'): " difficulty
    difficulty=${difficulty:-easy}
    sed -i "s/^difficulty=.*/difficulty=$difficulty/" $SERVER_PROPERTIES_FILE

    # Nombre maximum de joueurs
    read -p "Nombre maximum de joueurs (Appuyez sur Entrée pour utiliser la valeur par défaut '10'): " max_players
    max_players=${max_players:-10}
    sed -i "s/^max-players=.*/max-players=$max_players/" $SERVER_PROPERTIES_FILE

    # Mode en ligne
    read -p "Mode en ligne (true/false) (Appuyez sur Entrée pour utiliser la valeur par défaut 'true'): " online_mode
    online_mode=${online_mode:-true}
    sed -i "s/^online-mode=.*/online-mode=$online_mode/" $SERVER_PROPERTIES_FILE

    # Cheats autorisés
    read -p "Cheats autorisés (true/false) (Appuyez sur Entrée pour utiliser la valeur par défaut 'true'): " allow_cheats
    allow_cheats=${allow_cheats:-true}
    sed -i "s/^allow-cheats=.*/allow-cheats=$allow_cheats/" $SERVER_PROPERTIES_FILE

    echo "Configuration simple terminée."
}

# Fonction pour la configuration avancée
advanced_config() {
    echo "Configuration Avancée"
    echo "======================"

    # Afficher les lignes actuelles du fichier
    echo "Voici les lignes actuelles du fichier server.properties :"
    cat -n $SERVER_PROPERTIES_FILE

    # Demander à l'utilisateur quelle ligne modifier
    read -p "Entrez le numéro de la ligne que vous souhaitez modifier : " line_number
    read -p "Entrez la nouvelle valeur pour cette ligne : " new_value

    # Modifier la ligne spécifiée
    sed -i "${line_number}s/.*/$new_value/" $SERVER_PROPERTIES_FILE

    echo "Ligne $line_number modifiée avec succès."
}

# Menu principal
echo "Choisissez une option de configuration:"
echo "1. Configuration Simple"
echo "2. Configuration Avancée"
read -p "Entrez le numéro de l'option (1 ou 2): " choice

case $choice in
    1)
        simple_config
        ;;
    2)
        advanced_config
        ;;
    *)
        echo "Option invalide. Veuillez choisir 1 ou 2."
        ;;
esac