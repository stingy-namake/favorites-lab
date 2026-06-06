import { Router } from 'express';
import db from '../db.js';
import { getProduct } from '../services/fakestore.js';

const router = Router({ mergeParams: true });

router.post('/', async (req, res) => {
  const { id } = req.params;
  const { product_id } = req.body;

  const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(id);
  if (!customer) {
    return res.status(404).json({ error: 'customer not found' });
  }

  try {
    await getProduct(product_id);
  } catch {
    return res.status(400).json({ error: 'product not found in external API' });
  }

  const existing = db.prepare('SELECT id FROM favorites WHERE customer_id = ? AND product_id = ?').get(id, product_id);
  if (existing) {
    return res.status(409).json({ error: 'product is already a favorite of this customer' });
  }

  try {
    const stmt = db.prepare('INSERT INTO favorites (customer_id, product_id) VALUES (?, ?)');
    const result = stmt.run(id, product_id);
    res.status(201).json({ id: result.lastInsertRowid, customer_id: Number(id), product_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { id } = req.params;

  const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(id);
  if (!customer) {
    return res.status(404).json({ error: 'customer not found' });
  }

  const favorites = db.prepare('SELECT product_id FROM favorites WHERE customer_id = ? ORDER BY id').all(id);

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
  const { id, product_id } = req.params;

  const stmt = db.prepare('DELETE FROM favorites WHERE customer_id = ? AND product_id = ?');
  const result = stmt.run(id, product_id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'favorite not found' });
  }
  res.status(204).send();
});

export default router;
