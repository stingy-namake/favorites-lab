import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  const { nome, email } = req.body;
  if (!nome || !email) {
    return res.status(400).json({ error: 'nome e email obrigatorios' });
  }
  try {
    const stmt = db.prepare('INSERT INTO clientes (nome, email) VALUES (?, ?)');
    const result = stmt.run(nome, email);
    res.status(201).json({ id: result.lastInsertRowid, nome, email });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'email ja cadastrado' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  const clientes = db.prepare('SELECT * FROM clientes ORDER BY id').all();
  res.json(clientes);
});

router.put('/:id', (req, res) => {
  const { nome, email } = req.body;
  const { id } = req.params;
  try {
    const stmt = db.prepare('UPDATE clientes SET nome = ?, email = ? WHERE id = ?');
    const result = stmt.run(nome, email, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'cliente nao encontrado' });
    }
    res.json({ id: Number(id), nome, email });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'email ja cadastrado' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM clientes WHERE id = ?');
  const result = stmt.run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'cliente nao encontrado' });
  }
  res.status(204).send();
});

export default router;
