import { Router } from 'express';
import db from '../db.js';
import { getProduct } from '../services/fakestore.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const user_id = req.user.id;
  const items = db.prepare('SELECT product_id, quantity FROM cart_items WHERE user_id = ? ORDER BY id').all(user_id);

  const results = await Promise.allSettled(
    items.map(item => getProduct(item.product_id))
  );

  const data = [];
  for (let i = 0; i < items.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      data.push({
        product_id: items[i].product_id,
        title: r.value.title,
        image: r.value.image,
        price: r.value.price,
        quantity: items[i].quantity,
      });
    }
  }

  res.json(data);
});

router.post('/', async (req, res) => {
  const user_id = req.user.id;
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required' });
  }

  try {
    await getProduct(product_id);
  } catch {
    return res.status(400).json({ error: 'product not found in external API' });
  }

  const existing = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?').get(user_id, product_id);

  try {
    if (existing) {
      db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
    } else {
      db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(user_id, product_id, quantity);
    }
    res.status(201).json({ message: 'item added to cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:product_id', (req, res) => {
  const user_id = req.user.id;
  const { product_id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'quantity must be at least 1' });
  }

  const existing = db.prepare('SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?').get(user_id, product_id);
  if (!existing) {
    return res.status(404).json({ error: 'item not in cart' });
  }

  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, existing.id);
  res.json({ message: 'quantity updated' });
});

router.delete('/:product_id', (req, res) => {
  const user_id = req.user.id;
  const { product_id } = req.params;

  const stmt = db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?');
  const result = stmt.run(user_id, product_id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'item not in cart' });
  }
  res.status(204).send();
});

router.delete('/', (req, res) => {
  const user_id = req.user.id;
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(user_id);
  res.status(204).send();
});

export default router;
