import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { Env, Variables } from '../types';

const favorites = new Hono<{ Bindings: Env; Variables: Variables }>();
favorites.use('*', authMiddleware);

export { favorites };

favorites.get('/', async (c) => {
  const userId = c.get('userId');
  const items = await c.env.DB.prepare(
    'SELECT id, product_id FROM favorites WHERE user_id = ?'
  ).bind(userId).all();
  return c.json(items.results);
});

favorites.post('/', async (c) => {
  const userId = c.get('userId');
  const { product_id } = await c.req.json();
  if (!product_id) return c.json({ error: 'product_id required' }, 400);

  const existing = await c.env.DB.prepare(
    'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?'
  ).bind(userId, product_id).first();
  if (existing) return c.json({ message: 'Already favorited' }, 200);

  const result = await c.env.DB.prepare(
    'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)'
  ).bind(userId, product_id).run();

  return c.json({ id: Number(result.meta.last_row_id), product_id }, 201);
});

favorites.delete('/:productId', async (c) => {
  const userId = c.get('userId');
  const productId = c.req.param('productId');

  const item = await c.env.DB.prepare(
    'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?'
  ).bind(userId, productId).first();
  if (!item) return c.json({ error: 'Favorite not found' }, 404);

  await c.env.DB.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?')
    .bind(userId, productId).run();
  return c.json({ message: 'Removed from favorites' });
});
