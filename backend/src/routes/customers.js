import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  try {
    const stmt = db.prepare('INSERT INTO customers (name, email) VALUES (?, ?)');
    const result = stmt.run(name, email);
    res.status(201).json({ id: result.lastInsertRowid, name, email });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'email already in use' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  const customers = db.prepare('SELECT * FROM customers ORDER BY id').all();
  res.json(customers);
});

router.put('/:id', (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;
  try {
    const stmt = db.prepare('UPDATE customers SET name = ?, email = ? WHERE id = ?');
    const result = stmt.run(name, email, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'customer not found' });
    }
    res.json({ id: Number(id), name, email });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'email already in use' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
  const result = stmt.run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'customer not found' });
  }
  res.status(204).send();
});

export default router;
