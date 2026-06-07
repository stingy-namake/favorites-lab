import { Hono } from 'hono';
import { getCachedProducts, setCachedProducts } from '../utils/cache';
import { Env, Product } from '../types';

const products = new Hono<{ Bindings: Env }>();

export { products };

const FAKESTORE_BASE = 'https://fakestoreapi.com';

async function fetchAllProducts(): Promise<Product[]> {
  const cached = await getCachedProducts();
  if (cached) return JSON.parse(cached);

  const res = await fetch(`${FAKESTORE_BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch products from FakeStoreAPI');
  const data: Product[] = await res.json();
  await setCachedProducts(JSON.stringify(data));
  return data;
}

products.get('/', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '12')));
  const category = c.req.query('category');
  const search = c.req.query('q');

  let allProducts = await fetchAllProducts();

  if (category) {
    allProducts = allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    allProducts = allProducts.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  const total = allProducts.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const items = allProducts.slice(start, start + limit);

  return c.json({ items, total, page, totalPages, hasMore: page < totalPages });
});

products.get('/categories', async (c) => {
  const allProducts = await fetchAllProducts();
  const categories = [...new Set(allProducts.map(p => p.category))].sort();
  return c.json(categories);
});

products.get('/:id', async (c) => {
  const id = c.req.param('id');
  const allProducts = await fetchAllProducts();
  const product = allProducts.find(p => p.id === Number(id));
  if (!product) return c.json({ error: 'Product not found' }, 404);
  return c.json(product);
});
