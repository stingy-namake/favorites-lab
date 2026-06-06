import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'authentication required' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}
