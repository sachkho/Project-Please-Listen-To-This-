### Projet : Walkman - Listening Machine

---

#### Description du Projet

Cette partie du projet permet de classifier des données audio en temps réel ou à partir de fichiers audio. Elle utilise PyQt5 pour l'interface utilisateur des tests et Mediapipe pour le traitement audio et la classification.

---

#### Fichiers Principaux

1. **app_test.py**
   - Ce fichier contient l'interface graphique de l'application PyQt5.
   - Il permet de sélectionner le mode de fonctionnement (flux continu ou fichier) et l'appareil d'entrée.
   - Il démarre et arrête le processus de classification audio et affiche les résultats dans une zone de texte.
   - Utilise également `ClassDistributionGraph` pour générer et afficher des graphiques de distribution de classes.

2. **audio_processing.py**
   - Fournit des fonctions pour gérer les périphériques d'entrée audio, lire les fichiers audio et lancer le processus de classification audio à l'aide de Mediapipe.
   - Contient `launchListeningMachine` pour démarrer la machine d'écoute en fonction du mode sélectionné.

3. **audio_classifier.py**
   - Contient les fonctions et les configurations pour classifier les données audio à l'aide de Mediapipe.
   - Définit `classify_audio` pour classer les données audio et `output_class` pour traiter les résultats de classification.

4. **main.py**
   - Permet de lancer la machine d'écoute à partir de données JSON en entrée, définissant le mode de fonctionnement, l'ID du périphérique d'entrée et les données audio.

---

#### Utilisation

Pour utiliser l'application :
- Sélectionnez le mode (flux continu ou fichier) et l'appareil d'entrée si nécessaire.
- Choisissez un fichier audio si vous êtes en mode fichier.
- Démarrez la classification en cliquant sur "Start Classification".
- Arrêtez la classification à tout moment en cliquant sur "Stop Classification".
- Les résultats de la classification s'affichent en temps réel dans la zone de texte.
- Un graphique de distribution des classes est généré à la fin de la classification.

Pour lancer le test depuis le répertoire racine :\
`cd src/listening_ai/code/py_solutions`\
`python3 test_app.py`

pip uninstall pyaudio
pip install pyaudio

---

#### Dépendances

- PyQt5 : Interface utilisateur
- Mediapipe : Classification audio
- Matplotlib : Affichage de graphiques

---

#### Licence

Cette partie est sous licence Apache 2.0, permettant une utilisation libre sous certaines conditions.

---

#### Remarques

- Assurez-vous d'avoir les bibliothèques nécessaires installées (`PyQt5`, `matplotlib`, `scipy`, `pyaudio`, `mediapipe`).

Si ce n'est déjà fait, afin d'installer toutes les dépendances de la partie IA, lancer la commande suivant depuis la racine :\
`pip install -r src/listening_ai/requirements.txt`

- Pour plus de détails sur l'implémentation spécifique des fonctions et des classes, référez-vous aux fichiers source fournis.

---

Ce fichier README fournit un aperçu général du projet et guide l'utilisateur sur son utilisation et ses dépendances. Pour des détails spécifiques sur l'implémentation des fonctions ou pour des questions sur le fonctionnement, veuillez vous référer aux fichiers source correspondants.