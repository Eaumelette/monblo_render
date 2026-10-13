const BlogPost = require('../models/BlogPost');

module.exports = async (req, res, next) => {
  try {
    const blogpost = await BlogPost.findById(req.params.id);

    if (!blogpost) {
      return res.status(404).render('notfound', { title: 'Page introuvable' });
    }

    res.render('post', { title: blogpost.title, blogpost });
  } catch (error) {
    next(error);
  }
};
