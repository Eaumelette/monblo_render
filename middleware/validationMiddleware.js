module.exports = (req, res, next) => {
  const title = (req.body.title || '').trim();
  const body = (req.body.body || '').replace(/<[^>]*>/g, '').trim();
  const errors = [];

  if (!title) {
    errors.push('Le titre est obligatoire.');
  }
  if (!body) {
    errors.push('Le contenu de l\'article est obligatoire.');
  }

  if (errors.length > 0) {
    req.flash('postErrors', errors);
    req.flash('postData', req.body);
    return res.redirect('/posts/new');
  }

  next();
};
