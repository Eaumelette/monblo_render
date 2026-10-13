const BlogPost = require('../models/BlogPost');

module.exports = async (req, res, next) => {
  try {
    const blogposts = await BlogPost.findAll();

    res.render('index', { title: 'Accueil', blogposts });
  } catch (error) {
    next(error);
  }
};
