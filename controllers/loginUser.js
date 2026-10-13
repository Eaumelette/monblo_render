const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);

    if (!user || typeof password !== 'string' || !(await bcrypt.compare(password, user.password))) {
      return res.redirect('/auth/login');
    }

    req.session.userId = user.id;
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};
