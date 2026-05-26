const jwtUtil = require('../utils/jwt.util');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || null;
  if (!token) return res.status(401).json({ success: false, error: 'No token provided', code: 'NO_TOKEN' });

  const payload = jwtUtil.verifyAccessToken(token);
  if (!payload) return res.status(401).json({ success: false, error: 'Invalid token', code: 'INVALID_TOKEN' });

  req.userId = payload.id;
  req.user = payload;
  next();
};
