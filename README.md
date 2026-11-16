# BLUE ALERTS — RTS

Projet RTS avec deux éléments conservés distinctement :

- **Prototype web** : [BLUE_ALERTS.html](./BLUE_ALERTS.html), prototype HTML/Three.js existant.
- **Moteur 3D Java** : [OpenRTS](https://github.com/methusalah/OpenRTS), ajouté comme sous-module Git à `engine/OpenRTS`.
- **Audit des moteurs RTS** : [docs/RTS_ENGINE_AUDIT.md](./docs/RTS_ENGINE_AUDIT.md), comparatif des candidats, licences et plan d'intégration.

## Récupérer le dépôt complet

Clone avec sous-modules :

```bash
git clone --recurse-submodules https://github.com/Ascameleon/Blue-alert.git
cd Blue-alert
```

Si le dépôt a déjà été cloné sans le moteur :

```bash
git submodule update --init --recursive
```

Le sous-module est épinglé sur le commit OpenRTS `6066640f8ef2fa18b1de3e0dd213e4871b4b8543`.

## Lancer OpenRTS

La version référencée utilise Java 21, Gradle et jMonkeyEngine 3.8.1 selon son dernier commit. Depuis le sous-module :

```bash
cd engine/OpenRTS
./gradlew run
```

Sous Windows, utiliser `gradlew.bat run`. Un JDK 21 et l'accès réseau aux dépendances Gradle peuvent être nécessaires.

Commandes annoncées par OpenRTS : **F1** mode jeu, **F2** éditeur, **F3** vue à la première personne.

## État d'intégration — à lire

OpenRTS est référencé dans ce dépôt comme sous-module Git. **Il n'est pas encore fusionné avec le prototype HTML** : ce sont deux applications et technologies distinctes (Java/jMonkeyEngine contre HTML/JavaScript/Three.js). Le jeu Java doit être compilé et lancé pour valider l'environnement, puis les mécaniques BLUE ALERTS (factions, unités, économie, missions et interface) doivent être portées ou adaptées dans OpenRTS.

OpenRTS est sous licence MIT ; conserver ses notices lors de toute redistribution. Aucun achat n'est requis pour cette étape, mais le build télécharge des dépendances si elles ne sont pas déjà en cache.

## Prototype web historique

Le fichier `BLUE_ALERTS.html` conserve l'ancien prototype web et reste distinct du build V94 publié. Il conserve son ancien chargement de Three.js ; pour la version autonome et hors ligne, utiliser le build V94 préparé par `scripts/prepare-pages-site.sh`.


## Version 94 — intégration des modèles 3D

Fichier de première version intégrée : [BLUE_ALERTS_v94_ASSET_INTEGRATION.html](./BLUE_ALERTS_v94_ASSET_INTEGRATION.html).

Cette version conserve la boucle de jeu et les mécaniques du prototype web, tout en utilisant la bibliothèque procédurale `game-data/models/blue-alert-models.js` pour le visuel des chars légers/lourds, fantassins, QG, centrale utilitaire, caserne, usine, raffinerie et tourelles. La citadelle et les moissonneuses gardent leurs modèles natifs. Si la bibliothèque de modèles ne peut pas être chargée, le code visuel natif de secours reste présent.

Le déploiement GitHub Pages prépare `index.html` à partir de cette version, puis embarque localement `public/vendor/three.min.js`, `public/vendor/THREE-LICENSE.txt` et la bibliothèque de modèles. Le runtime Three.js du build publié ne dépend donc pas d'un CDN au lancement ; la notice MIT de Three.js est conservée dans le site préparé. Pour tester les fichiers du dépôt, lance la préparation avec `bash scripts/prepare-pages-site.sh site`, puis sers le dossier `site` via HTTP (par exemple `python3 -m http.server 4173 --directory site`) ; ne l'ouvre pas depuis une page GitHub `blob`. Le rendu WebGL reste soumis à la prise en charge WebGL du navigateur et doit être vérifié sur un appareil réel.
