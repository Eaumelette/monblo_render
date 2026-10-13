const BlogPost = require('../models/BlogPost');
const { parseImage } = require('../lib/parseImage');
const { putImage, deleteImage, keyFromPath } = require('../lib/imageStore');

module.exports = async (req, res, next) => {
  try {
    const blogpost = await BlogPost.findById(req.params.id);

    if (!blogpost) {
      return res.status(404).render('notfound', { title: 'Page introuvable' });
    }

    // Seul l'auteur peut modifier son article
    if (!BlogPost.isOwner(blogpost, req.session.userId)) {
      return res.redirect('/');
    }

    const title = (req.body.title || '').trim();
    const body = (req.body.body || '').trim();

    if (!title || !body) {
      return res.redirect('/posts/' + blogpost._id + '/edit');
    }

    // Remplacement de l'image uniquement si une nouvelle image est envoyée
    let image = '';
    const parsed = parseImage(req.body.image);
    if (parsed) {
      const key = await putImage(parsed);
      image = '/images/' + key;
    }

    await BlogPost.update(blogpost._id, { title, body, image });

    // L'ancienne image est supprimée une fois le remplacement enregistré
    if (image && blogpost.image) {
      const oldKey = keyFromPath(blogpost.image);
      if (oldKey) {
        try {
          await deleteImage(oldKey);
        } catch (error) {
          console.error('Suppression de l\'ancienne image impossible :', error.message);
        }
      }
    }

    res.redirect('/post/' + blogpost._id);
  } catch (error) {
    next(error);
  }
};
