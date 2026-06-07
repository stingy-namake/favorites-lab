<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { getFavoritesStore } from '$lib/stores/favorites.svelte';
  import { goto } from '$app/navigation';
  import type { Product } from '$lib/types';

  let { params } = $props();
  const auth = getAuthStore();
  const cart = getCartStore();
  const favs = getFavoritesStore();

  let product = $state<Product | null>(null);
  let loading = $state(true);
  let error = $state('');
  let imgError = $state(false);

  onMount(async () => {
    try { product = await api.products.get(Number(params.id)); }
    catch (e: any) { error = e.message || 'Product not found'; }
    loading = false;
  });

  function addToCart() { if (product && auth.isAuthenticated) cart.add(product.id); }
  function goToCart() { goto('/cart'); }
  function toggleFav() {
    if (!product || !auth.isAuthenticated) return;
    if (favs.isFavorited(product.id)) favs.remove(product.id);
    else favs.add(product.id);
  }
</script>

{#if loading}
  <p class="empty-state">Loading...</p>
{:else if error}
  <div class="empty-state"><p style="color:var(--danger);">{error}</p></div>
{:else if product}
  <div class="detail">
    <div class="detail-img">
      {#if imgError}
        <div class="detail-img-placeholder">Image not available</div>
      {:else}
        <img src={product.image} alt={product.title} onerror={() => imgError = true} />
      {/if}
    </div>
    <div class="detail-info">
      <span class="detail-category">{product.category}</span>
      <h1 class="detail-title">{product.title}</h1>
      <div class="detail-price-row">
        <span class="detail-price">${product.price.toFixed(2)}</span>
        <span class="detail-rating">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          {product.rating.rate.toFixed(1)} <span style="color:var(--text-muted);font-weight:400;">/ 5 ({product.rating.count} reviews)</span>
        </span>
      </div>
      <p class="detail-desc">{product.description}</p>
      {#if auth.isAuthenticated}
        <div class="detail-actions">
          <button class="primary detail-cart-btn btn-animate" class:in-cart={cart.items.some(i => i.product_id === product.id)} onclick={cart.items.some(i => i.product_id === product.id) ? goToCart : addToCart}>
            {cart.items.some(i => i.product_id === product.id) ? 'GO TO CART' : 'ADD TO CART'}
          </button>
          <button class="detail-fav-btn btn-animate" class:faved={favs.isFavorited(product.id)} onclick={toggleFav}>
            {#if favs.isFavorited(product.id)}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              FAVORITED
            {:else}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              ADD TO FAVORITES
            {/if}
          </button>
        </div>
      {:else}
        <p style="color:var(--text-muted);font-size:0.9rem;margin-top:1rem;"><a href="/auth/login" style="color:var(--primary);font-weight:600;">Login</a> to add to cart or favorites.</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .detail { display:grid; grid-template-columns:1fr 1fr; gap:2.5rem; padding:1rem 0; }
  .detail-img { display:flex; align-items:center; justify-content:center; background:var(--bg-alt); border-radius:var(--radius-lg); padding:2rem; min-height:450px; }
  .detail-img img { max-height:380px; max-width:100%; object-fit:contain; }
  .detail-img-placeholder { color:var(--text-muted); font-size:0.9rem; }
  .detail-info { display:flex; flex-direction:column; gap:0.75rem; }
  .detail-category { font-size:0.75rem; font-weight:600; color:var(--primary); text-transform:uppercase; letter-spacing:0.08em; }
  .detail-title { font-size:1.5rem; font-weight:700; line-height:1.3; }
  .detail-price-row { display:flex; align-items:baseline; gap:1rem; }
  .detail-price { font-size:1.75rem; font-weight:800; }
  .detail-rating { font-size:0.9rem; color:var(--text-muted); font-weight:600; display:flex; align-items:center; gap:0.25rem; }
  .detail-desc { color:var(--text-muted); line-height:1.7; font-size:0.9rem; }
  .detail-actions { display:flex; gap:0.75rem; margin-top:0.5rem; }
  .detail-cart-btn { padding:0.875rem 2.5rem; font-size:0.9rem; font-weight:700; letter-spacing:0.04em; }
  .detail-fav-btn { display:flex; align-items:center; gap:0.375rem; padding:0.875rem 1.5rem; font-size:0.8rem; font-weight:600; background:transparent; border:1px solid var(--border); }
  .detail-fav-btn:hover { border-color:var(--primary); color:var(--primary); }
  .detail-fav-btn.faved { background:var(--primary-light); border-color:var(--primary); color:var(--primary); }
</style>
