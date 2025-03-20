#!/bin/bash

# Définition des variables
SERVER_DIR="/home/serveur-minecraft/MinecraftServer"  # Le chemin réel de ton serveur
LOG_DIR="$SERVER_DIR/logs"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/mcbedrock_$TIMESTAMP.log"
ARCHIVE_DAYS=7  # Nombre de jours avant d'archiver les logs
ARCHIVE_FILE="$LOG_DIR/archive_$(date +"%Y-%m-%d").tar.gz"

# Création du dossier de logs s'il n'existe pas
mkdir -p "$LOG_DIR"

# Démarrer le serveur et rediriger la sortie vers le fichier de log
cd "$SERVER_DIR" || exit
./bedrock_server 2>&1 | tee -a "$LOG_FILE"

# Archivage des logs plus anciens que ARCHIVE_DAYS jours
find "$LOG_DIR" -name "mcbedrock_*.log" -type f -mtime +$ARCHIVE_DAYS -exec tar -rvf "$ARCHIVE_FILE" {} \; -exec rm {} \;

# Nettoyage des archives trop anciennes (par exemple, conserver les 30 derniers jours)
find "$LOG_DIR" -name "archive_*.tar.gz" -type f -mtime +30 -delete