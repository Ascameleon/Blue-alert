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

## Prototype web

Le fichier `BLUE_ALERTS.html` conserve le prototype web précédent. Son rendu 3D dépend du chargement de Three.js depuis un CDN ; le mode 3D hors ligne n'est pas garanti.
