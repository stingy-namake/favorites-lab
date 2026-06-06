import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { generateToken } from '../middleware/auth.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }
  try {
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, hash);
    const user = { id: result.lastInsertRowid, name, email };
    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'email already registered' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'invalid email or password' });
  }
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'authentication required' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], SECRET);
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json(user);
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
});

export default router;
