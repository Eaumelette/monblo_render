const bcrypt = require('bcryptjs');
const { sql } = require('../db');

function toUser(row) {
  return row ? { _id: row.id, id: row.id, username: row.username, password: row.password } : null;
}

function parseId(id) {
  const value = Number.parseInt(id, 10);
  return Number.isInteger(value) && value > 0 ? value : null;
}

async function findById(id) {
  const userId = parseId(id);
  if (!userId) {
    return null;
  }
  const rows = await sql`SELECT * FROM users WHERE id = ${userId}`;
  return toUser(rows[0]);
}

async function findByUsername(username) {
  if (!username || typeof username !== 'string') {
    return null;
  }
  const rows = await sql`SELECT * FROM users WHERE username = ${username}`;
  return toUser(rows[0]);
}

// Crée un utilisateur (mot de passe haché). Lève une erreur contenant
// "validationErrors" si les données sont invalides.
async function create({ username, password } = {}) {
  const name = typeof username === 'string' ? username.trim() : '';
  const errors = [];

  if (!name) {
    errors.push('Veuillez saisir un nom d\'utilisateur.');
  }
  if (!password || typeof password !== 'string') {
    errors.push('Veuillez saisir un mot de passe.');
  }
  if (errors.length === 0 && (await findByUsername(name))) {
    errors.push('Ce nom d\'utilisateur est déjà utilisé.');
  }

  if (errors.length > 0) {
    const error = new Error('Données utilisateur invalides');
    error.validationErrors = errors;
    throw error;
  }

  const hash = await bcrypt.hash(password, 10);
  const rows = await sql`
    INSERT INTO users (username, password) VALUES (${name}, ${hash})
    RETURNING *
  `;
  return toUser(rows[0]);
}

module.exports = { findById, findByUsername, create, parseId };
