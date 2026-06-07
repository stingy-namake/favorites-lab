import type { FavoriteItem } from '$lib/types';
import { api } from '$lib/api';
import { getAuthStore } from './auth.svelte';

let items = $state<FavoriteItem[]>([]);
let loading = $state(false);

async function fetchFavorites() {
  const auth = getAuthStore();
  if (!auth.isAuthenticated) { items = []; return; }
  loading = true;
  try {
    items = await api.favorites.list();
    await enrichProducts();
  } catch { items = []; }
  loading = false;
}

async function enrichProducts() {
  items = await Promise.all(items.map(async (fav) => {
    try {
      const product = await api.products.get(fav.product_id);
      return { ...fav, product };
    } catch { return fav; }
  }));
}

async function add(productId: number) {
  await api.favorites.add(productId);
  await fetchFavorites();
}

async function remove(productId: number) {
  await api.favorites.remove(productId);
  await fetchFavorites();
}

function isFavorited(productId: number): boolean {
  return items.some(f => f.product_id === productId);
}

export function getFavoritesStore() {
  return {
    get items() { return items; },
    get loading() { return loading; },
    get count() { return items.length; },
    fetchFavorites,
    add,
    remove,
    isFavorited,
  };
}
