const { Pool } = require('pg');

// Pool de connexions PostgreSQL unique, réutilisé par toute l'application.
let pool;

function sslConfig() {
  const url = process.env.DATABASE_URL || '';
  // Une base locale (Docker/localhost) n'utilise pas SSL ; Render l'exige dès
  // que la connexion n'est pas locale.
  if (!url || /(^|@)(localhost|127\.0\.0\.1)/.test(url) || process.env.PGSSL === 'false') {
    return false;
  }
  return { rejectUnauthorized: false };
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig()
    });
  }
  return pool;
}

// Requête SQL paramétrée via un template literal :
//   const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
// Les valeurs sont passées en paramètres ($1, $2, ...) : pas d'injection SQL.
function sql(strings, ...values) {
  const text = strings.reduce(
    (query, part, index) => query + part + (index < values.length ? `$${index + 1}` : ''),
    ''
  );
  return getPool()
    .query(text, values)
    .then((result) => result.rows);
}

module.exports = { getPool, sql };
