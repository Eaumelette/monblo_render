# Mon Blog (Render)

Blog **Node.js / Express / EJS / PostgreSQL**, prévu pour un déploiement sur **Render** (Web Service) avec une
base **PostgreSQL** managée. Aucune dépendance à une plateforme serverless : c'est une application Express
classique (`bin/www`) qui tourne sur un serveur Node.

## Fonctionnalités

- **Authentification** : inscription, connexion, déconnexion (mots de passe hachés avec bcrypt)
- **CRUD articles** : créer, lire, modifier, supprimer
- **Image à la une** stockée en binaire (`bytea`) dans PostgreSQL et servie par une route dédiée
- **Validation** côté serveur (titre et contenu obligatoires)
- **Vues EJS** avec layouts (header / navbar / footer)
- **Migrations SQL** versionnées (`db/migrations/`), appliquées automatiquement au déploiement

## Prérequis (local)

- [Node.js](https://nodejs.org/) 18 ou plus récent
- Une base **PostgreSQL** (locale ou via Docker)

## Installation

```bash
npm install
cp .env.example .env
```

Renseignez `.env` :

```env
DATABASE_URL=postgres://user:password@localhost:5432/monblog
SESSION_SECRET=une-chaine-longue-et-aleatoire
NODE_ENV=development
```

## Lancer en local

```bash
# 1. Créer/peupler le schéma (une fois, et après chaque nouvelle migration)
npm run migrate

# 2. Démarrer le serveur
npm start        # http://localhost:3000
# ou
npm run dev      # avec rechargement automatique
```

### Postgres rapide avec Docker

```bash
docker run --name monblog-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=monblog -p 5432:5432 -d postgres:16
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/monblog
```

## Déploiement sur Render

Le fichier [`render.yaml`](./render.yaml) décrit l'infrastructure (Web Service + base PostgreSQL + migrations).

1. Pousser le code sur GitHub.
2. Sur [Render](https://render.com) : **New → Blueprint**, sélectionnez le dépôt. Render lit `render.yaml`
   et crée la base + le service.
3. `DATABASE_URL` est injecté automatiquement depuis la base ; `SESSION_SECRET` est généré automatiquement.
4. À chaque déploiement, une **Pre-Deploy Command** exécute `npm run migrate`.

> Sans Blueprint : créez une base PostgreSQL, puis un **Web Service** Node
> (`Build Command: npm install`, `Start Command: npm start`), avec `DATABASE_URL` (Internal Database URL),
> `SESSION_SECRET` et `NODE_ENV=production`, et une Pre-Deploy Command `npm run migrate`.

### Compte de démonstration

- **Utilisateur** : `valentin`
- **Mot de passe** : `MotDePasse123`

## Routes principales

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/` | Liste des articles |
| `GET` | `/post/:id` | Détail d'un article |
| `GET` | `/posts/new` | Formulaire de création (auth) |
| `POST` | `/posts/store` | Enregistrer un article (auth) |
| `GET` | `/posts/:id/edit` | Formulaire d'édition (auth) |
| `POST` | `/posts/:id/edit` | Mettre à jour un article (auth) |
| `POST` | `/posts/:id/delete` | Supprimer un article (auth) |
| `GET` | `/auth/register` · `/auth/login` · `/auth/logout` | Authentification |
| `GET` | `/images/:key` | Image d'un article |
| `GET` | `/about` · `/contact` | Pages statiques |

## Structure du projet

```
monblo_render/
├── render.yaml                  # Blueprint Render (service + base + migrations)
├── bin/www                      # Point d'entrée du serveur
├── app.js                       # Configuration Express et routes
├── db/
│   ├── index.js                 # Pool PostgreSQL + helper SQL (pg)
│   ├── sessionStore.js          # Store de sessions Express en base
│   ├── migrate.js               # Runner de migrations
│   └── migrations/              # Fichiers SQL versionnés
├── lib/
│   ├── parseImage.js            # Décodage / validation de l'image (data URI -> Buffer)
│   └── imageStore.js            # Lecture / écriture des images (bytea)
├── controllers/                 # Logique des routes
├── middleware/                  # Auth, validation, redirection
├── models/                      # Accès aux données (User, BlogPost)
├── views/                       # Templates EJS + layouts
└── public/                      # Fichiers statiques (CSS, JS)
```

## Migrations

- Les fichiers vivent dans `db/migrations/` et sont nommés `<numero>_<slug>.sql`.
- `npm run migrate` applique les fichiers non encore joués et note leur passage dans `schema_migrations`.
- Pour modifier le schéma, ajoutez un **nouveau** fichier (ne modifiez jamais une migration déjà appliquée).

## Notes techniques

- **Connexion** : pool `pg` partagé, SSL activé automatiquement hors `localhost`.
- **Sessions** : persistées dans la table `sessions` (survivent aux redémarrages).
- **Images** : converties en data URI côté client (`FileReader`), décodées côté serveur puis stockées en
  `bytea` dans la table `images`. La base ne garde que `/images/<clé>` ; la route les sert avec
  `Cache-Control: public, max-age=31536000, immutable`. Limite : 2 Mo par image.
- **Sécurité** : requêtes 100 % paramétrées (`$1`, `$2`, ...), mots de passe hachés (bcrypt).

## Licence

Projet personnel à but pédagogique.
