CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_posted TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX blog_posts_date_posted_idx ON blog_posts (date_posted DESC);

-- Sessions Express (persistées en base pour survivre aux redémarrages)
CREATE TABLE sessions (
  sid TEXT PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);

CREATE INDEX sessions_expire_idx ON sessions (expire);

-- Images des articles (stockées en binaire dans la base)
CREATE TABLE images (
  key TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  data BYTEA NOT NULL
);

-- Données de démonstration (utilisateur : valentin / MotDePasse123)
INSERT INTO users (username, password) VALUES ('valentin', '$2a$10$BngF4CDqWEEhoPcXfke3JeU.SbWkxVH2hzheW4FyDm7jy28r7BbHO');

INSERT INTO blog_posts (title, body, user_id)
SELECT v.title, v.body, u.id FROM users u, (VALUES
  ('Bienvenue sur mon blog', '<p>Ceci est le <strong>premier article</strong> de mon blog réalisé avec Node.js, Express, EJS et PostgreSQL.</p>'),
  ('Pourquoi EJS ?', '<p>EJS permet de générer du HTML dynamique en intégrant du JavaScript directement dans les vues.</p>'),
  ('PostgreSQL', '<p>PostgreSQL est une base de données relationnelle robuste, utilisée ici via le pilote <em>pg</em>.</p>')
) AS v(title, body) WHERE u.username = 'valentin';
