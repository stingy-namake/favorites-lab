import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock cache utils
vi.mock('../utils/cache', () => ({
  getCachedProducts: vi.fn().mockResolvedValue(null),
  setCachedProducts: vi.fn().mockResolvedValue(undefined),
}));

// Mock global fetch
const mockProducts = [
  { id: 1, title: 'Test Product', price: 10, category: 'test', image: '', description: 'desc', rating: { rate: 4, count: 10 } },
  { id: 2, title: 'Another Product', price: 20, category: 'other', image: '', description: 'desc2', rating: { rate: 3, count: 5 } },
];

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve(mockProducts),
}));

vi.stubGlobal('caches', {
  default: {
    match: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
  },
});

import { products } from './products';
import { Env } from '../types';

const mockEnv: Env = { DB: {} as any };

describe('Products Routes', () => {
  it('returns paginated products', async () => {
    const res = await products.request('/?limit=1&page=1', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(1);
    expect(data.total).toBe(2);
    expect(data.hasMore).toBe(true);
  });

  it('filters by category', async () => {
    const res = await products.request('/?category=test', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(1);
    expect(data.items[0].category).toBe('test');
  });
});
