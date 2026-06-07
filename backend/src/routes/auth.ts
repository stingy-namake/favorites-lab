import { Hono } from 'hono';
import { sign, base64UrlEncode } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import { Env, Variables } from '../types';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

export { auth };

async function hashPassword(password: string, salt?: Uint8Array): Promise<{ hash: string; salt: string }> {
  const pwKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const s = salt || crypto.getRandomValues(new Uint8Array(16));
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: s, iterations: 100000, hash: 'SHA-256' }, pwKey, 256);
  return { hash: base64UrlEncode(bits), salt: base64UrlEncode(s) };
}

async function verifyPassword(password: string, storedSalt: string, storedHash: string): Promise<boolean> {
  const raw = atob(storedSalt.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  const { hash } = await hashPassword(password, bytes);
  return hash === storedHash;
}

auth.post('/signup', async (c) => {
  const { email, password, name } = await c.req.json();
  if (!email || !password || !name) return c.json({ error: 'Email, password, and name required' }, 400);
  if (typeof email !== 'string' || !email.includes('@')) return c.json({ error: 'Invalid email' }, 400);
  if (password.length < 6) return c.json({ error: 'Password must be at least 6 characters' }, 400);

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return c.json({ error: 'Email already registered' }, 409);

  const { hash, salt } = await hashPassword(password);
  const stored = `${salt}:${hash}`;

  const result = await c.env.DB.prepare(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
  ).bind(email, stored, name).run();

  const token = await sign({ sub: Number(result.meta.last_row_id), role: 'user' }, c.env);
  return c.json({ token, user: { id: Number(result.meta.last_row_id), email, name, role: 'user' } }, 201);
});

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: 'Email and password required' }, 400);

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) return c.json({ error: 'Invalid email or password' }, 401);

  const stored = (user as any).password_hash;
  const [salt, hash] = stored.split(':');
  const valid = await verifyPassword(password, salt, hash);
  if (!valid) return c.json({ error: 'Invalid email or password' }, 401);

  const token = await sign({ sub: (user as any).id, role: (user as any).role }, c.env);
  return c.json({
    token,
    user: { id: (user as any).id, email: (user as any).email, name: (user as any).name, role: (user as any).role },
  });
});

auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const user = await c.env.DB.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').bind(userId).first();
  if (!user) return c.json({ error: 'User not found' }, 404);
  return c.json(user);
});
