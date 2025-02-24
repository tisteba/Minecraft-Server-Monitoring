# Hébergement d'un serveur Minecraft Bedrock Edition avec gestion via une interface web

**Membres du groupe** : Vicenzzo Maciel Rigo, Anthony Goasdoué, Baptiste Renou

## Objectifs :

**Hébergement du serveur Minecraft :**

 - Installer et configurer un serveur Minecraft Bedrock Edition sur une VM avec Rocky Linux.

- Optimiser les performances du serveur.

**Gestion via une interface web :**

Créer une interface web permettant de :

- Surveiller les performances du serveur (utilisation CPU, RAM, espace disque, etc.).

- Effectuer des actions administratives à distance, comme démarrer/arrêter le serveur, modifier le nombre de joueurs max, bannir des joueurs, etc.

**Monitoring et Maintenance :**

- Mettre en place des outils de monitoring (ex : Grafana, Prometheus) pour suivre l'état du serveur.

- Ajouter des fonctionnalités d'alertes (ex : notifications lorsque les performances sont faibles).


 **Amélioration et évolutivité :**

Début avec une VM, puis envisager le passage à un serveur dédié si nécessaire, en fonction des performances et des besoins.


---

Lien du git :
 https://github.com/tisteba/Minecraft-Server-Monitoring.git


OS du serveur : Rocky linux


🌟 Pourquoi Rocky Linux pour notre serveur Minecraft Bedrock ?
1️⃣ Stabilité et Fiabilité 🏗️

    Rocky Linux est conçu pour les serveurs en production : il offre une grande stabilité et des mises à jour bien contrôlées.

    Contrairement à Ubuntu, il ne reçoit pas de mises à jour fréquentes qui pourraient casser des services.

    Support à long terme (10 ans), ce qui évite d’avoir à changer d’OS régulièrement.

2️⃣ Sécurité Renforcée 🔒

    Rocky Linux bénéficie des meilleures pratiques en entreprise (inspiré de RHEL).
    Les mises à jour de sécurité sont régulières et bien testées, ce qui réduit les risques d’instabilité.

    Par défaut, il inclut SELinux, un système avancé de protection contre les attaques.

    Meilleure gestion des accès et des rôles, parfait pour sécuriser notre serveur de jeu et éviter les intrusions.

3️⃣ Performance et Optimisation ⚡

    Utilisation minimale des ressources (moins de consommation mémoire que Ubuntu Server).

    Idéal pour un serveur dédié, car il optimise les performances réseau et disque.

    Gestion avancée des services et processus, permettant une meilleure répartition des ressources (CPU, RAM).

4️⃣ Gestion des Paquets et Maintenance 🛠️

    Utilisation de dnf, un gestionnaire de paquets plus sécurisé et fiable que apt.

    Mises à jour transactionnelles : si une mise à jour échoue, on peut facilement la revenir en arrière sans casser le système.

    Moins de maintenance requise qu’Ubuntu : on installe, on configure, et on est tranquille !

5️⃣ Adaptabilité à Notre Projet 🎮

    Parfait pour héberger un serveur Minecraft Bedrock, avec meilleure stabilité réseau et gestion avancée des logs.

    Compatible avec nos besoins de monitoring via des outils comme Grafana, Prometheus et Cockpit.
    
    Permet de contrôler notre serveur depuis une interface web pour démarrer/arrêter le serveur, gérer les joueurs et modifier les configs.