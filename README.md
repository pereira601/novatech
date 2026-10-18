# NovaTech Ultimate

Version avancée du site NovaTech : effets visuels inspirés de la 3D, animation d'étoiles, design responsive, formulaire de contact relié à une API, et tableau de bord d'administration.

## Lancer le site sur ton ordinateur

Prérequis : Node.js 18 ou plus récent.

1. Décompresse `novatech_ultimate.zip`.
2. Ouvre un terminal dans le dossier du projet.
3. Lance `npm start`.
4. Ouvre `http://localhost:3000` dans ton navigateur.
5. Tableau de bord : `http://localhost:3000/admin.html`.

Le serveur utilise uniquement les modules intégrés de Node.js : aucune installation de dépendances n'est nécessaire.

## Accès administrateur de démonstration

- Identifiant par défaut : `admin`
- Mot de passe par défaut : `ChangeMoi-123!`

**Avant une mise en ligne publique, définis des identifiants uniques et robustes** via les variables d'environnement `ADMIN_USER` et `ADMIN_PASSWORD`. Exemple (Linux/macOS) :

```bash
ADMIN_USER="ton_identifiant" ADMIN_PASSWORD="un_mot_de_passe_long_et_unique" npm start
```

Les messages sont enregistrés dans `data/messages.json`. Ce fichier est créé au premier démarrage.

## Fonctionnalités

- Page d'accueil futuriste et responsive
- Animations CSS, étoiles animées et illustrations 3D CSS
- Filtres de projets, menu mobile et animations au défilement
- Formulaire validé côté serveur et messages enregistrés
- Connexion admin, recherche, statuts, suppression et déconnexion
- En-têtes de sécurité de base et cookie de session HttpOnly

## Avant la production

Cette archive fournit un projet complet prêt à lancer, mais ne signifie pas que le site est déjà hébergé sur Internet. Pour une vraie mise en production, configure HTTPS, des identifiants secrets, une limitation de tentatives de connexion, une sauvegarde et idéalement une base de données persistante. Le formulaire stocke les messages dans un fichier local et ne les envoie pas automatiquement par e-mail.