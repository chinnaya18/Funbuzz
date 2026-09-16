const scorerOrAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'scorer'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Evaluator or Admin privileges required.' });
  }
  next();
};

module.exports = scorerOrAdmin;
