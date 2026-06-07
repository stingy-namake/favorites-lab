<script lang="ts">
  import type { Product } from '$lib/types';
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { getFavoritesStore } from '$lib/stores/favorites.svelte';
  import { getProductOverlay } from '$lib/stores/productOverlay.svelte';
  import { goto } from '$app/navigation';

  let { product }: { product: Product } = $props();

  const auth = getAuthStore();
  const cart = getCartStore();
  const favs = getFavoritesStore();
  const overlay = getProductOverlay();

  let imgError = $state(false);
  let imgLoaded = $state(false);

  function addToCart() {
    if (!auth.isAuthenticated) return;
    cart.add(product.id);
  }

  function goToCart() {
    goto('/cart');
  }

  function toggleFav() {
    if (!auth.isAuthenticated) return;
    if (favs.isFavorited(product.id)) favs.remove(product.id);
    else favs.add(product.id);
  }
</script>

<div class="card">
  <button class="card-img" onclick={() => overlay.open(product)}>
    {#if imgError}
      <div class="card-img-placeholder">No Image</div>
    {:else}
      <div class="card-img-wrap">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          class:loaded={imgLoaded}
          onload={() => imgLoaded = true}
          onerror={() => imgError = true}
        />
      </div>
    {/if}
  </button>
  <div class="card-body">
    <div class="card-top">
      <span class="card-category">{product.category}</span>
      <button class="card-title" onclick={() => overlay.open(product)}>{product.title}</button>
      <div class="card-footer">
        <span class="card-price">${product.price.toFixed(2)}</span>
        <span class="card-rating">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          {product.rating.rate.toFixed(1)}
        </span>
      </div>
    </div>
    {#if auth.isAuthenticated}
      <div class="card-actions">
        <button class="primary btn-animate" class:in-cart={cart.items.some(i => i.product_id === product.id)} onclick={cart.items.some(i => i.product_id === product.id) ? goToCart : addToCart}>
          {cart.items.some(i => i.product_id === product.id) ? 'GO TO CART' : 'ADD TO CART'}
        </button>
        <button class="fav-btn btn-animate" class:faved={favs.isFavorited(product.id)} onclick={toggleFav}>
          {#if favs.isFavorited(product.id)}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {:else}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .card { background:var(--bg-card); border-radius:var(--radius-lg); overflow:hidden; transition:box-shadow 0.2s, transform 0.2s; display:flex; flex-direction:column; }
  .card:hover { box-shadow:var(--shadow-lg); transform:translateY(-2px); }

  .card-img { display:block; width:100%; border:none; border-radius:0; padding:0; background:none; cursor:pointer; }
  .card-img-wrap { position:relative; padding-top:100%; background:var(--bg-alt); overflow:hidden; }
  .card-img-wrap img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; padding:1.5rem; opacity:0; transition:opacity 0.3s; }
  .card-img-wrap img.loaded { opacity:1; }
  .card-img-placeholder { height:180px; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:0.85rem; background:var(--bg-alt); }

  .card-body { padding:0.75rem; display:flex; flex-direction:column; flex:1; justify-content:space-between; }
  .card-top { display:flex; flex-direction:column; gap:0.35rem; }

  .card-category { font-size:0.7rem; font-weight:600; color:var(--primary); text-transform:uppercase; letter-spacing:0.05em; }

  .card-title { font-size:0.85rem; font-weight:500; color:var(--text); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-decoration:none; cursor:pointer; background:none; border:none; padding:0; text-align:left; }
  .card-title:hover { color:var(--primary); }

  .card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:0.15rem; }

  .card-price { font-size:1.1rem; font-weight:700; color:var(--text); }

  .card-rating { font-size:0.75rem; color:var(--text-muted); display:flex; align-items:center; gap:0.2rem; }

  .card-actions { display:flex; gap:0.375rem; padding-top:0.4rem; }
  .card-actions button.primary { flex:1; font-size:0.75rem; font-weight:700; padding:0.5rem 0.75rem; letter-spacing:0.03em; }

  .fav-btn { width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center; font-size:1rem; background:var(--bg-alt); border:1px solid var(--border); border-radius:var(--radius); flex-shrink:0; }
  .fav-btn:hover { border-color:var(--primary); color:var(--primary); }
  .fav-btn.faved { background:var(--primary-light); border-color:var(--primary); color:var(--primary); }
</style>
