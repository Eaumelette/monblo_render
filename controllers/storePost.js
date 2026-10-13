const BlogPost = require('../models/BlogPost');
const { parseImage } = require('../lib/parseImage');
const { putImage } = require('../lib/imageStore');

module.exports = async (req, res, next) => {
  try {
    const title = (req.body.title || '').trim();
    const body = (req.body.body || '').trim();

    let image = '';
    const parsed = parseImage(req.body.image);
    if (parsed) {
      const key = await putImage(parsed);
      image = '/images/' + key;
    }

    await BlogPost.create({
      title,
      body,
      image,
      userId: req.session.userId
    });

    res.redirect('/');
  } catch (error) {
    next(error);
  }
};
