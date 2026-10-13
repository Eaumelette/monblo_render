const session = require('express-session');
const { sql } = require('./index');

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24;

// Store express-session qui persiste les sessions dans la table "sessions"
// (la mémoire d'une fonction serverless est perdue entre deux invocations).
class PostgresSessionStore extends session.Store {
  expiration(sess) {
    const maxAge = sess && sess.cookie && sess.cookie.maxAge;
    return new Date(Date.now() + (typeof maxAge === 'number' ? maxAge : DEFAULT_TTL_MS));
  }

  get(sid, callback) {
    sql`SELECT sess FROM sessions WHERE sid = ${sid} AND expire > NOW()`
      .then((rows) => callback(null, rows[0] ? rows[0].sess : null))
      .catch(callback);
  }

  set(sid, sess, callback) {
    const expire = this.expiration(sess);
    sql`
      INSERT INTO sessions (sid, sess, expire)
      VALUES (${sid}, ${JSON.stringify(sess)}::jsonb, ${expire})
      ON CONFLICT (sid) DO UPDATE SET sess = EXCLUDED.sess, expire = EXCLUDED.expire
    `
      .then(() => callback && callback(null))
      .catch((error) => callback && callback(error));
  }

  touch(sid, sess, callback) {
    const expire = this.expiration(sess);
    sql`UPDATE sessions SET expire = ${expire} WHERE sid = ${sid}`
      .then(() => callback && callback(null))
      .catch((error) => callback && callback(error));
  }

  destroy(sid, callback) {
    // On en profite pour purger les sessions expirées
    sql`DELETE FROM sessions WHERE sid = ${sid} OR expire < NOW()`
      .then(() => callback && callback(null))
      .catch((error) => callback && callback(error));
  }
}

module.exports = PostgresSessionStore;
