import { Router } from 'express';
import db from '../db.js';
import { getProduct } from '../services/fakestore.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { product_id } = req.body;
  const user_id = req.user.id;

  try {
    await getProduct(product_id);
  } catch {
    return res.status(400).json({ error: 'product not found in external API' });
  }

  const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?').get(user_id, product_id);
  if (existing) {
    return res.status(409).json({ error: 'product already in your favorites' });
  }

  try {
    const stmt = db.prepare('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)');
    const result = stmt.run(user_id, product_id);
    res.status(201).json({ id: result.lastInsertRowid, user_id, product_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const user_id = req.user.id;

  const favorites = db.prepare('SELECT product_id FROM favorites WHERE user_id = ? ORDER BY id').all(user_id);

  const results = await Promise.allSettled(
    favorites.map(f => getProduct(f.product_id))
  );

  const data = results
    .filter(r => r.status === 'fulfilled')
    .map(r => ({
      id: r.value.id,
      title: r.value.title,
      image: r.value.image,
      price: r.value.price,
      rating: r.value.rating || null,
    }));

  res.json(data);
});

router.delete('/:product_id', (req, res) => {
  const user_id = req.user.id;
  const { product_id } = req.params;

  const stmt = db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?');
  const result = stmt.run(user_id, product_id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'favorite not found' });
  }
  res.status(204).send();
});

export default router;
