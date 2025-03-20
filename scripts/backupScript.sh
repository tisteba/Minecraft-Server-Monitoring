#!/bin/bash

# Dossier du serveur Minecraft Bedrock (à adapter)
MC_SERVER_PATH="/home/serveur-minecraft/MinecraftServer"

# Dossier où stocker les sauvegardes
BACKUP_PATH="/var/backups/minecraft/"

# Nom du fichier de sauvegarde avec horodatage
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_PATH/minecraft_backup_$TIMESTAMP.tar.gz"

# Créer le dossier de sauvegarde s'il n'existe pas
mkdir -p "$BACKUP_PATH"

# Sauvegarder le dossier "worlds"
tar -czf "$BACKUP_FILE" -C "$MC_SERVER_PATH" worlds

# Garder uniquement les 5 dernières sauvegardes
ls -tp "$BACKUP_PATH"/minecraft_backup_* | grep -v '/$' | tail -n +6 | xargs -I {} rm -- {}

echo "Sauvegarde créée : $BACKUP_FILE"




