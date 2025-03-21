# 🎮 MineServer

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/tisteba/Minecraft-Server-Monitoring)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./Wiki/LICENCE.md)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)

---

## Prérequis

Avant de commencer, assurez-vous que les éléments suivants sont configurés sur votre serveur :

- **Ubuntu 18.04 LTS** ou supérieur
- **Node.js** v14 ou supérieur
- **SSH** avec privilèges sudo
- **Git**
- **2GB de RAM minimum**
- **Pare-feu configuré** (Ports nécessaires : 22 pour SSH, 19132 pour Minecraft, 8080 pour l'interface web)
- **Clé SSH générée et configurée** pour une connexion sécurisée
- **Utilisateur dédié** pour exécuter le serveur Minecraft

---

## 🚀 Installation

### 1. Cloner le dépôt
Clonez le dépôt GitHub pour récupérer les fichiers nécessaires au projet.
```bash
git clone https://github.com/tisteba/Minecraft-Server-Monitoring.git
cd Minecraft-Server-Monitoring
```

### 2. Rendre le script exécutable
Assurez-vous que le script `mineserver.sh` est exécutable :
```bash
chmod +x mineserver.sh
```

### 3. Exécuter l'installation
Lancez le script d'installation pour configurer le serveur Minecraft automatiquement :
```bash
./mineserver.sh
```

Suivez les instructions qui s'affichent à l'écran pour finaliser l'installation.

---

## 🌐 Interface Web

### Lancer l'interface web
1. Démarrez le serveur web :
   ```bash
   node ./Web/Backend/server.js
   ```

2. Ouvrez votre navigateur et accédez à [localhost:8080](http://localhost:8080).

### Changer le port
Par défaut, l'interface web utilise le port **8080**. Pour modifier ce port :
1. Ouvrez le fichier `Web/Backend/server.js`.
2. Modifiez la ligne suivante :
   ```javascript
   server.listen(8080, ...);
   ```
3. Redémarrez le serveur web pour appliquer la modification.

---

## 🛠️ Développement

### Structure du projet
Voici la structure du répertoire du projet :
```
MineServer 
├─ .gitignore
├─ README.md
├─ Web
│  ├─ Backend
│  │  └─ server.js
│  └─ Frontend
│     ├─ Css
│     │  ├─ common
│     │  │  ├─ base.css
│     │  │  └─ components.css
│     │  └─ pages
│     │     ├─ dashboard.css
│     │     └─ presentation.css
│     ├─ Html
│     │  ├─ index.html
│     │  └─ presentation.html
│     └─ Js
│        ├─ common
│        │  ├─ navigation.js
│        │  └─ theme.js
│        └─ pages
│           └─ dashboard.js
├─ bedrock-server-1.21.62.01.zip
├─ mineserver.sh
├─ package-lock.json
├─ package.json
└─ scripts
   ├─ backupScript.sh
   ├─ configuration.sh
   ├─ server.properties
   ├─ serverInstall.sh
   ├─ startServer.sh
   └─ test.sh
```

---

## 💡 Contribuer

Vous souhaitez contribuer à ce projet ? Voici comment :

1. **Forkez** ce dépôt
2. **Créez une branche** pour votre fonctionnalité :
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Commitez** vos modifications :
   ```bash
   git commit -m "Ajout d'une fonctionnalité"
   ```
4. **Poussez** la branche :
   ```bash
   git push origin feature/my-feature
   ```
5. Ouvrez une **pull request** sur GitHub pour intégrer vos changements.

---

## 📜 Licence

Ce projet est sous la **licence MIT**. Consultez le fichier `LICENSE` pour plus de détails.

---

### Contact

Développé avec 💖 par l’équipe **MineServer**  
**© 2025 Étudiants YNOV**

[**GitHub**](https://github.com/tisteba/Minecraft-Server-Monitoring)

--- 