Dougs - Test Technique

## Lancement
### 1. Serveur
- Se placer dans le dossier du serveur
- Lancer la commande: docker compose up
### 2. App
- Se placer dans le dossier de l'app
- Lancer les commandes:
  - yarn
  - yarn ios

## Login
 - email: test@gmail.com
 - password: test1234

## Commentaires
  - Je n'ai pas eu le temps d'implémenter swagger et les tests back-end et front-end
  - Regarder la vidéo "demo.mp4" afin de faire le tour de l'app et des fonctionnalités
  - Dans la liste des "fiscal months":
    - Le sablier signifie que le client n'a pas encore soumis le relevé bancaire du mois
    - Le check signifie que le relevé bancaire coïncide avec la somme des opérations du mois (provenant de la synchronisation bancaire)
    - Le warning signifie que le relevé bancaire ne coïncide pas avec la somme des opérations du mois (provenant de la synchronisation bancaire)




William Serviant
wil_serv@hotmail.com