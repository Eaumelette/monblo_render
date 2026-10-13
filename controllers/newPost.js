module.exports = (req, res) => {
  const data = req.flash('postData')[0] || {};

  res.render('create', {
    title: 'Nouveau post',
    createPost: true,
    errors: req.flash('postErrors'),
    postTitle: data.title || '',
    postBody: data.body || ''
  });
};
