# Soirée Culturelle Nufi Tên Thu 2026 - Scanner & Validation

Ce projet contient l'application de validation des billets pour la Soirée Culturelle Nufi Tên Thu qui aura lieu en Mai 2026.

## Fonctionnalités

*   **Scanner de QR Code** : Utilise la caméra de l'appareil pour scanner les billets.
*   **Validation des Lots** : Gestion de 40 lots de 10 entrées chacun.
*   **Suivi en Temps Réel** : Affichage du nombre d'entrées utilisées et restantes par lot.
*   **Mode Hors-Ligne** : Fonctionne sans connexion internet (PWA / Webview), les données sont stockées localement.
*   **Saisie Manuelle** : Possibilité de valider un code manuellement si le scan échoue.
*   **Import/Export** : Sauvegarde et restauration de l'état des validations via fichier JSON.

## Structure du Projet

*   `scanner/` : Contient le code source de l'application web (HTML, CSS, JS).
    *   `index.html` : Interface principale.
    *   `style.css` : Styles de l'application.
    *   `app.js` : Logique de l'application (scan, validation, état).
    *   `logo.png` : Logo de l'association.

## Utilisation

1.  Ouvrir `scanner/index.html` dans un navigateur moderne (Chrome, Firefox, Safari) ou via l'application Android dédiée.
2.  Autoriser l'accès à la caméra.
3.  Scanner le QR Code d'un billet.
4.  L'application indique si le billet est valide et met à jour le compteur du lot correspondant.

## Technologies

*   HTML5 / CSS3
*   JavaScript (Vanilla)
*   [html5-qrcode](https://github.com/mebjas/html5-qrcode) pour la lecture des QR Codes.
*   LocalStorage pour la persistance des données.

## Auteur

Association Nufi Nten Tht Suisse
