// Backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token mancante' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token mancante' });

  jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token non valido' });
    req.user = user;
    next();
  });
};

// Per rotte admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.ruolo === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Accesso riservato agli admin' });
  }
};