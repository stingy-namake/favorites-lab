import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { Env, Variables } from '../types';

const admin = new Hono<{ Bindings: Env; Variables: Variables }>();
admin.use('*', authMiddleware, adminMiddleware);

export { admin };

admin.get('/users', async (c) => {
  const users = await c.env.DB.prepare(
    'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
  ).all();
  return c.json(users.results);
});

admin.delete('/users/:id', async (c) => {
  const id = c.req.param('id');
  const target = await c.env.DB.prepare('SELECT id, role FROM users WHERE id = ?').bind(id).first();
  if (!target) return c.json({ error: 'User not found' }, 404);
  if ((target as any).role === 'admin') return c.json({ error: 'Cannot delete admin users' }, 403);

  await c.env.DB.prepare('DELETE FROM carts WHERE user_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM favorites WHERE user_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  return c.json({ message: 'User deleted' });
});
