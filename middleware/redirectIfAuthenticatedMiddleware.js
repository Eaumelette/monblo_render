// Empêche un utilisateur déjà connecté d'accéder aux pages login/register
module.exports = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/');
  }

  next();
};
