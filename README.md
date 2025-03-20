# Minecraft Serveur avec Monitoring

## 📌 Introduction
Ce projet vise à automatiser l'installation et le déploiement d'un serveur Minecraft Bedrock sur un serveur Ubuntu. Il comprend également une interface web permettant de surveiller les performances du serveur (RAM, CPU) et d'interagir avec lui via une invite de commande. Plusieurs scripts Bash ont été développés pour améliorer la gestion des logs et des sauvegardes du monde, ainsi que pour renforcer la sécurité d'accès au serveur.

## ✨ Fonctionnalités
- **Déploiement automatique** du serveur Minecraft Bedrock via des scripts Bash
- **Interface web** en HTML/CSS/JS avec un backend en JavaScript pour afficher l'utilisation des ressources et interagir avec le serveur
- **Gestion avancée des logs**
  - Un nouveau fichier de logs est créé à chaque démarrage du serveur
  - Compression des logs après **7 jours**
  - Suppression des logs après **30 jours**
- **Sauvegarde automatique du monde**
  - Une sauvegarde est effectuée **toutes les 3 heures**
  - Un maximum de **5 sauvegardes** est conservé avant suppression
- **Automatisation avec Cron** pour exécuter les scripts à intervalles réguliers
- **Sécurisation de l'accès SSH**
  - Accès uniquement via clés privées
  - Désactivation de l'authentification SSH par mot de passe
  - Seuls les membres du goupe de la personne ayant déployé le script peuvent accéder au serveur en tant qu'utilisateur `minecraft-serveur`

## 🛠 Installation
### 📋 Prérequis
- Un serveur sous **Ubuntu**
- Une connexion SSH avec droits sudo
- Clés SSH pour une connexion sécurisée

### 🚀 Étapes d'installation
1. Cloner ce dépôt sur votre serveur Ubuntu :
   ```bash
   git clone https://github.com/tisteba/Minecraft-Server-Monitoring.git
   cd Minecraft-Server-Monitoring
   ```
2. Exécuter le script d'installation :
   ```bash
   chmod +x mineserver.sh
   ./mineserver.sh
   ```
3. Suivre les instructions affichées pour finaliser l'installation.

## 🎮 Utilisation
### 🖥 Accéder au serveur Minecraft
- Le serveur démarre automatiquement après installation
- Pour le démarrer manuellement :
  ```bash
  ./startServer.sh
  ```

- Pour l'éteindre :
  ```bash
  stop
  ```
  (Dans l'invit de commande du serveur)

### 🌐 Interface Web
- Ouvrir un navigateur et accéder à :
  ```
  http://<IP_DU_SERVEUR>:<PORT>
  ```
- Affiche les performances du serveur
- Permet d'exécuter des commandes sur le serveur Minecraft

## 🔒 Sécurité et Accès SSH
- Connexion SSH uniquement via clés privées :
  ```bash
  ssh -i <chemin_de_votre_clé> user@<IP_DU_SERVEUR>
  ```
- Pour interagir avec Minecraft, basculer vers l'utilisateur applicatif :
  ```bash
  sudo su - minecraft-serveur
  ```

## ⏳ Automatisation avec Cron
- **Logs** : Compression après **7 jours**, suppression après **30 jours**
- **Sauvegardes** : Toutes les **3 heures**, conservation des **5 dernières**
- Tâches planifiées visibles avec :
  ```bash
  crontab -l
  ```

## ⚙️ Détails techniques
- **Backend** : JavaScript
- **Frontend** : HTML/CSS/JS
- **Scripts** : Bash
- **Stockage des logs** : Fichier dédié dans les dossiers du serveur Minecraft

## 🤝 Auteurs et Crédits
- Projet réalisé par: **Vicenzzo Maciel Rigo, Anthony Goasdoué, Baptiste Renou**
