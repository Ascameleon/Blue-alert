# BLUE ALERTS — RTS

Prototype RTS jouable en HTML/Three.js, optimisé pour pouvoir être essayé dans un navigateur moderne, y compris sur Android.

## Lancer le jeu

1. Ouvrir **[BLUE_ALERTS.html](./BLUE_ALERTS.html)**.
2. Pour le rendu 3D, le navigateur doit pouvoir charger Three.js depuis un CDN et autoriser les modules JavaScript.
3. Si le chargement 3D échoue, le fichier contient un mode de compatibilité 2D de secours. Ce mode est distinct du rendu 3D.

## Commandes et systèmes présents dans le prototype

- Sélection et ordres d'unités RTS.
- Économie, production et construction de bâtiments.
- Unités militaires, combats, projectiles et objectifs de mission.
- Interface de jeu et minimap.
- Tentatives de chargement de Three.js depuis plusieurs CDN avec mode de secours.

## État et limites

Ce dépôt contient un **prototype jouable**, pas un jeu commercial final ni un moteur RTS complet. Le fichier HTML charge des ressources réseau pour le rendu 3D : le fonctionnement 3D hors ligne n'est pas garanti. Les performances et la compatibilité doivent encore être testées sur appareils Android réels.

## Fichier principal

- `BLUE_ALERTS.html` — prototype HTML autonome (le moteur Three.js est chargé depuis un CDN).
