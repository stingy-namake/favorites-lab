import { Context, Next } from 'hono';
import { verify } from '../utils/jwt';
import { Env, Variables } from '../types';

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }
  const token = auth.slice(7);
  const payload = await verify(token, c.env);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
  c.set('userId', payload.sub);
  c.set('userRole', payload.role);
  await next();
}

export async function adminMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const role = c.get('userRole');
  if (role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
}
