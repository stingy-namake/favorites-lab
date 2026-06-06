import { Router } from 'express';
import axios from 'axios';

const router = Router();
const API_BASE = 'https://fakestoreapi.com';

router.get('/', async (req, res) => {
  try {
    const { data } = await axios.get(`${API_BASE}/products`);
    res.json(data);
  } catch {
    res.status(502).json({ error: 'failed to fetch products' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { data } = await axios.get(`${API_BASE}/products/categories`);
    res.json(data);
  } catch {
    res.status(502).json({ error: 'failed to fetch categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`${API_BASE}/products/${req.params.id}`);
    res.json(data);
  } catch {
    res.status(404).json({ error: 'product not found' });
  }
});

export default router;
