const User = require('../models/User');

// Vérifie que l'utilisateur possède une session valide
module.exports = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
