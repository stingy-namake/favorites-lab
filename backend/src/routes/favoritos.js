import { Router } from 'express';
import db from '../db.js';
import { getProduct } from '../services/fakestore.js';

const router = Router({ mergeParams: true });

router.post('/', async (req, res) => {
  const { id } = req.params;
  const { product_id } = req.body;

  const cliente = db.prepare('SELECT id FROM clientes WHERE id = ?').get(id);
  if (!cliente) {
    return res.status(404).json({ error: 'cliente nao encontrado' });
  }

  try {
    await getProduct(product_id);
  } catch {
    return res.status(400).json({ error: 'produto nao encontrado na API externa' });
  }

  const existing = db.prepare('SELECT id FROM favoritos WHERE cliente_id = ? AND product_id = ?').get(id, product_id);
  if (existing) {
    return res.status(409).json({ error: 'produto ja e favorito deste cliente' });
  }

  try {
    const stmt = db.prepare('INSERT INTO favoritos (cliente_id, product_id) VALUES (?, ?)');
    const result = stmt.run(id, product_id);
    res.status(201).json({ id: result.lastInsertRowid, cliente_id: Number(id), product_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { id } = req.params;

  const cliente = db.prepare('SELECT id FROM clientes WHERE id = ?').get(id);
  if (!cliente) {
    return res.status(404).json({ error: 'cliente nao encontrado' });
  }

  const favoritos = db.prepare('SELECT product_id FROM favoritos WHERE cliente_id = ? ORDER BY id').all(id);

  const results = await Promise.allSettled(
    favoritos.map(f => getProduct(f.product_id))
  );

  const data = results
    .filter(r => r.status === 'fulfilled')
    .map(r => ({
      id: r.value.id,
      titulo: r.value.title,
      imagem: r.value.image,
      preco: r.value.price,
      avaliacao: r.value.rating || null,
    }));

  res.json(data);
});

router.delete('/:product_id', (req, res) => {
  const { id, product_id } = req.params;

  const stmt = db.prepare('DELETE FROM favoritos WHERE cliente_id = ? AND product_id = ?');
  const result = stmt.run(id, product_id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'favorito nao encontrado' });
  }
  res.status(204).send();
});

export default router;
