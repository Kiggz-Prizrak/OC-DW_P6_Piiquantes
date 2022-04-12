const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    const { userId } = decodedToken;

    req.auth = { userId };
    if (req.body.userId && req.body.userId !== userId) {
      throw Error('User ID non valable !');
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({ error: error || 'Requête non authentifié ! ' });
  }
};
