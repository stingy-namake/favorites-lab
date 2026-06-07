import type { AuthResponse, Product, PaginatedResponse, CartItem, FavoriteItem, User } from './types';

const BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    signup: (data: { email: string; password: string; name: string }) =>
      request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<User>('/auth/me'),
  },
  products: {
    list: (params?: { page?: number; limit?: number; category?: string; q?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.category) qs.set('category', params.category);
      if (params?.q) qs.set('q', params.q);
      return request<PaginatedResponse<Product>>(`/products?${qs}`);
    },
    get: (id: number) => request<Product>(`/products/${id}`),
    categories: () => request<string[]>('/products/categories'),
  },
  cart: {
    list: () => request<CartItem[]>('/cart'),
    add: (product_id: number, quantity = 1) =>
      request<CartItem>('/cart', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
    update: (id: number, quantity: number) =>
      request<CartItem>(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    remove: (id: number) =>
      request<void>(`/cart/${id}`, { method: 'DELETE' }),
  },
  favorites: {
    list: () => request<FavoriteItem[]>('/favorites'),
    add: (product_id: number) =>
      request<FavoriteItem>('/favorites', { method: 'POST', body: JSON.stringify({ product_id }) }),
    remove: (productId: number) =>
      request<void>(`/favorites/${productId}`, { method: 'DELETE' }),
  },
  admin: {
    users: () => request<User[]>('/admin/users'),
    deleteUser: (id: number) =>
      request<void>(`/admin/users/${id}`, { method: 'DELETE' }),
  },
};
