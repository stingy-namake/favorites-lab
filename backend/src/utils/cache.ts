const PRODUCT_CACHE_KEY = 'https://fakestoreapi.com/products';

export async function getCachedProducts(): Promise<string | null> {
  try {
    const cache = caches.default;
    const response = await cache.match(PRODUCT_CACHE_KEY);
    if (response) return response.text();
    return null;
  } catch {
    return null;
  }
}

export async function setCachedProducts(data: string): Promise<void> {
  try {
    const cache = caches.default;
    const response = new Response(data, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
    await cache.put(PRODUCT_CACHE_KEY, response);
  } catch {
    // Cache API may not be available in all environments
  }
}
