require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { getPool } = require('./index');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// Applique, dans l'ordre, les fichiers .sql non encore joués.
// L'historique est conservé dans la table "schema_migrations".
async function migrate() {
  const pool = getPool();
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  await pool.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())'
  );
  const { rows } = await pool.query('SELECT name FROM schema_migrations');
  const applied = new Set(rows.map((row) => row.name));

  for (const file of files) {
    if (applied.has(file)) {
      console.log('déjà appliquée :', file);
      continue;
    }

    const sqlText = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sqlText);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log('appliquée :', file);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  await pool.end();
  console.log('Migrations à jour.');
}

migrate().catch((error) => {
  console.error('Migration échouée :', error.message);
  process.exit(1);
});
