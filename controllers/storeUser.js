const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    await User.create(req.body);
    res.redirect('/');
  } catch (error) {
    const validationErrors = error.validationErrors || ['Une erreur est survenue lors de l\'inscription.'];

    if (!error.validationErrors) {
      console.error(error);
    }

    req.flash('validationErrors', validationErrors);
    req.flash('data', { username: req.body.username });
    res.redirect('/auth/register');
  }
};
