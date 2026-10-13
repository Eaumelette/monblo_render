const BlogPost = require('../models/BlogPost');
const { deleteImage, keyFromPath } = require('../lib/imageStore');

module.exports = async (req, res, next) => {
  try {
    const blogpost = await BlogPost.findById(req.params.id);

    if (!blogpost) {
      return res.status(404).render('notfound', { title: 'Page introuvable' });
    }

    // Seul l'auteur peut supprimer son article
    if (!BlogPost.isOwner(blogpost, req.session.userId)) {
      return res.redirect('/');
    }

    // Suppression de l'image associée (au mieux : n'empêche pas la suppression)
    const key = keyFromPath(blogpost.image);
    if (key) {
      try {
        await deleteImage(key);
      } catch (error) {
        console.error('Suppression de l\'image impossible :', error.message);
      }
    }

    await BlogPost.remove(blogpost._id);
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};
