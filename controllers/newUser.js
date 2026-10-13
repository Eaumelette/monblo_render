module.exports = (req, res) => {
  const data = req.flash('data')[0] || {};

  res.render('register', {
    title: 'Inscription',
    errors: req.flash('validationErrors'),
    username: data.username || '',
    password: data.password || ''
  });
};
