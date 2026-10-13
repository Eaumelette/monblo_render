const { sql } = require('../db');
const { parseId } = require('./User');

// Conserve la forme utilisée par les vues (_id, userid.username, datePosted)
function toPost(row) {
  if (!row) {
    return null;
  }
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    body: row.body,
    image: row.image || '',
    userid: { _id: row.user_id, username: row.username || null },
    datePosted: new Date(row.date_posted)
  };
}

// Liste des articles, sans l'image (base64) pour alléger la réponse
async function findAll() {
  const rows = await sql`
    SELECT p.id, p.title, p.body, p.user_id, p.date_posted, u.username
    FROM blog_posts p
    LEFT JOIN users u ON u.id = p.user_id
    ORDER BY p.date_posted DESC
  `;
  return rows.map(toPost);
}

async function findById(id) {
  const postId = parseId(id);
  if (!postId) {
    return null;
  }
  const rows = await sql`
    SELECT p.*, u.username
    FROM blog_posts p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.id = ${postId}
  `;
  return toPost(rows[0]);
}

async function create({ title, body, image, userId }) {
  const rows = await sql`
    INSERT INTO blog_posts (title, body, image, user_id)
    VALUES (${title}, ${body}, ${image || ''}, ${userId})
    RETURNING *
  `;
  return toPost(rows[0]);
}

async function update(id, { title, body, image }) {
  if (image) {
    await sql`UPDATE blog_posts SET title = ${title}, body = ${body}, image = ${image} WHERE id = ${id}`;
  } else {
    await sql`UPDATE blog_posts SET title = ${title}, body = ${body} WHERE id = ${id}`;
  }
}

async function remove(id) {
  await sql`DELETE FROM blog_posts WHERE id = ${id}`;
}

// Vérifie que l'utilisateur connecté est l'auteur de l'article
function isOwner(post, userId) {
  return Boolean(post && userId) && String(post.userid._id) === String(userId);
}

module.exports = { findAll, findById, create, update, remove, isOwner };
