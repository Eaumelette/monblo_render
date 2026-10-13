require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const PostgresSessionStore = require('./db/sessionStore');

const homeController = require('./controllers/home');
const newPostController = require('./controllers/newPost');
const storePostController = require('./controllers/storePost');
const getPostController = require('./controllers/getPost');
const editPostController = require('./controllers/editPost');
const updatePostController = require('./controllers/updatePost');
const deletePostController = require('./controllers/deletePost');
const newUserController = require('./controllers/newUser');
const storeUserController = require('./controllers/storeUser');
const loginController = require('./controllers/login');
const loginUserController = require('./controllers/loginUser');
const logoutController = require('./controllers/logout');

const validationMiddleware = require('./middleware/validationMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const redirectIfAuthenticatedMiddleware = require('./middleware/redirectIfAuthenticatedMiddleware');

const { getImage } = require('./lib/imageStore');

const app = express();

// Derrière le proxy Render : nécessaire pour les cookies / sessions en HTTPS
app.set('trust proxy', 1);

// Moteur de vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares généraux
app.use(logger('dev'));
app.use(express.json({ limit: '5mb' }));
// Limite élevée : les images sont envoyées encodées en base64 dans le formulaire
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Sessions stockées en base (persistantes)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'nodejs est top',
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore(),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      // "auto" : cookie sécurisé dès que la requête arrive en HTTPS (cas de Render)
      secure: 'auto',
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);
app.use(flash());

// Rend l'état de connexion accessible dans toutes les vues (navbar)
app.use((req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.userId);
  res.locals.currentUser = req.session.userId || null;
  next();
});

// Routes d'authentification
app.get('/auth/register', redirectIfAuthenticatedMiddleware, newUserController);
app.post('/users/register', redirectIfAuthenticatedMiddleware, storeUserController);
app.get('/auth/login', redirectIfAuthenticatedMiddleware, loginController);
app.post('/users/login', redirectIfAuthenticatedMiddleware, loginUserController);
app.get('/auth/logout', logoutController);

// Routes du blog
app.get('/', homeController);
app.get('/posts/new', authMiddleware, newPostController);
app.post('/posts/store', authMiddleware, validationMiddleware, storePostController);
app.get('/posts/:id/edit', authMiddleware, editPostController);
app.post('/posts/:id/edit', authMiddleware, updatePostController);
app.post('/posts/:id/delete', authMiddleware, deletePostController);
app.get('/post/:id', getPostController);

// Images des articles, stockées en base (bytea)
app.get('/images/:key', async (req, res, next) => {
  try {
    const image = await getImage(req.params.key);
    if (!image) {
      return res.status(404).end();
    }
    res.set('Content-Type', image.contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(image.data);
  } catch (error) {
    next(error);
  }
});

// Pages statiques
app.get('/about', (req, res) => res.render('about', { title: 'À propos' }));
app.get('/contact', (req, res) => res.render('contact', { title: 'Contact' }));

// Page 404 pour les routes inconnues
app.use((req, res) => {
  res.status(404).render('notfound', { title: 'Page introuvable' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.locals.message = err.message;
  // Détail de l'erreur affiché uniquement en développement explicite
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { title: 'Erreur' });
});

module.exports = app;
