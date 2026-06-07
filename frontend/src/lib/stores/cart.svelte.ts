import type { CartItem } from '$lib/types';
import { api } from '$lib/api';
import { getAuthStore } from './auth.svelte';

let items = $state<CartItem[]>([]);
let loading = $state(false);

async function fetchCart() {
  const auth = getAuthStore();
  if (!auth.isAuthenticated) { items = []; return; }
  loading = true;
  try {
    items = await api.cart.list();
    await enrichProducts();
  } catch { items = []; }
  loading = false;
}

async function enrichProducts() {
  items = await Promise.all(items.map(async (item) => {
    try {
      const product = await api.products.get(item.product_id);
      return { ...item, product };
    } catch { return item; }
  }));
}

async function add(productId: number, quantity = 1) {
  const item = await api.cart.add(productId, quantity);
  await fetchCart();
  return item;
}

async function update(id: number, quantity: number) {
  await api.cart.update(id, quantity);
  await fetchCart();
}

async function remove(id: number) {
  await api.cart.remove(id);
  await fetchCart();
}

function total() {
  return items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
}

export function getCartStore() {
  return {
    get items() { return items; },
    get loading() { return loading; },
    get count() { return items.reduce((s, i) => s + i.quantity, 0); },
    get total() { return total(); },
    fetchCart,
    add,
    update,
    remove,
  };
}
