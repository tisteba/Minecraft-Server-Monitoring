#!/bin/bash


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
    run_script "mineserver"
}