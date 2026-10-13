const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// Types d'images acceptés -> extension de fichier utilisée pour la clé du blob
const CONTENT_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg'
};

const DATA_URI = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/]+={0,2})$/i;

// Décode un data URI d'image en { buffer, contentType, extension }.
// Renvoie null si l'entrée est vide, invalide, d'un type non supporté
// ou trop volumineuse.
function parseImage(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const match = DATA_URI.exec(value.trim());
  if (!match) {
    return null;
  }

  const contentType = match[1].toLowerCase();
  const extension = CONTENT_TYPES[contentType];
  if (!extension) {
    return null;
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    return null;
  }

  return { buffer, contentType, extension };
}

module.exports = { parseImage, MAX_IMAGE_BYTES };
