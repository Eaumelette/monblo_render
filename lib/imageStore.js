const crypto = require('crypto');
const { sql } = require('../db');

// Une clé valide : <uuid>.<extension>, ex. "3f1c...-...-....png"
const KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{2,5}$/;

// Enregistre le buffer d'une image et renvoie la clé générée.
async function putImage({ buffer, contentType, extension }) {
  const key = `${crypto.randomUUID()}.${extension}`;
  await sql`
    INSERT INTO images (key, content_type, data)
    VALUES (${key}, ${contentType}, ${buffer})
  `;
  return key;
}

// Renvoie { data: Buffer, contentType } ou null si l'image est absente.
async function getImage(key) {
  if (!KEY_PATTERN.test(key)) {
    return null;
  }
  const rows = await sql`SELECT content_type, data FROM images WHERE key = ${key}`;
  const row = rows[0];
  if (!row) {
    return null;
  }
  return { data: row.data, contentType: row.content_type };
}

// Supprime une image (silencieux si la clé est invalide).
async function deleteImage(key) {
  if (!KEY_PATTERN.test(key)) {
    return;
  }
  await sql`DELETE FROM images WHERE key = ${key}`;
}

// "/images/<key>" -> "<key>", ou null si le chemin n'est pas une image.
function keyFromPath(imagePath) {
  if (typeof imagePath !== 'string') {
    return null;
  }
  const match = /^\/images\/(.+)$/.exec(imagePath);
  return match ? match[1] : null;
}

module.exports = { putImage, getImage, deleteImage, keyFromPath };
