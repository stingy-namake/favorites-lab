import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { Env, Variables } from '../types';

const cart = new Hono<{ Bindings: Env; Variables: Variables }>();
cart.use('*', authMiddleware);

export { cart };

cart.get('/', async (c) => {
  const userId = c.get('userId');
  const items = await c.env.DB.prepare(
    'SELECT c.id, c.product_id, c.quantity FROM carts c WHERE c.user_id = ?'
  ).bind(userId).all();
  return c.json(items.results);
});

cart.post('/', async (c) => {
  const userId = c.get('userId');
  const { product_id, quantity = 1 } = await c.req.json();
  if (!product_id) return c.json({ error: 'product_id required' }, 400);

  const existing = await c.env.DB.prepare(
    'SELECT id, quantity FROM carts WHERE user_id = ? AND product_id = ?'
  ).bind(userId, product_id).first();

  if (existing) {
    const newQty = (existing as any).quantity + quantity;
    await c.env.DB.prepare('UPDATE carts SET quantity = ? WHERE id = ?')
      .bind(newQty, (existing as any).id).run();
    return c.json({ id: (existing as any).id, product_id, quantity: newQty });
  }

  const result = await c.env.DB.prepare(
    'INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)'
  ).bind(userId, product_id, quantity).run();

  return c.json({ id: Number(result.meta.last_row_id), product_id, quantity }, 201);
});

cart.put('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const { quantity } = await c.req.json();
  if (!quantity || quantity < 1) return c.json({ error: 'Quantity must be >= 1' }, 400);

  const item = await c.env.DB.prepare(
    'SELECT id FROM carts WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first();
  if (!item) return c.json({ error: 'Cart item not found' }, 404);

  await c.env.DB.prepare('UPDATE carts SET quantity = ? WHERE id = ?').bind(quantity, id).run();
  return c.json({ id: Number(id), quantity });
});

cart.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const item = await c.env.DB.prepare(
    'SELECT id FROM carts WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first();
  if (!item) return c.json({ error: 'Cart item not found' }, 404);

  await c.env.DB.prepare('DELETE FROM carts WHERE id = ? AND user_id = ?').bind(id, userId).run();
  return c.json({ message: 'Removed from cart' });
});
