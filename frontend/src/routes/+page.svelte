<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { Product } from '$lib/types';
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { getFavoritesStore } from '$lib/stores/favorites.svelte';
  import { getProductOverlay } from '$lib/stores/productOverlay.svelte';
  import { goto } from '$app/navigation';

  const auth = getAuthStore();
  const cart = getCartStore();
  const favs = getFavoritesStore();
  const overlay = getProductOverlay();

  let categories = $state<{ name: string; items: Product[] }[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const res = await api.products.list({ limit: 50 });
      const map = new Map<string, Product[]>();
      for (const p of res.items) {
        if (!map.has(p.category)) map.set(p.category, []);
        map.get(p.category)!.push(p);
      }
      categories = Array.from(map.entries()).map(([name, items]) => ({ name, items }));
    } catch { /* ignore */ }
    loading = false;
  });

  function addToCart(id: number) {
    if (!auth.isAuthenticated) { goto('/auth/login'); return; }
    cart.add(id);
  }

  function toggleFav(id: number) {
    if (!auth.isAuthenticated) { goto('/auth/login'); return; }
    if (favs.isFavorited(id)) favs.remove(id);
    else favs.add(id);
  }

  function openOverlay(p: Product) {
    overlay.open(p);
  }
</script>

<div class="hero">
  <h1>Kishin Echoes</h1>
  <p>Browse our curated collection of products</p>
</div>

{#if loading}
  <p class="empty-state">Loading...</p>
{:else}
  {#each categories as cat}
    <section class="cat-section">
      <div class="cat-header">
        <h2 class="cat-title">{cat.name}</h2>
        <a href="/products?category={cat.name}" class="cat-viewall">View all</a>
      </div>
      <div class="cat-grid">
        {#each cat.items.slice(0, 4) as product (product.id)}
          <div class="card">
            <button class="card-img" onclick={() => openOverlay(product)}>
              <img src={product.image} alt={product.title} loading="lazy" />
            </button>
            <div class="card-body">
              <button class="card-title" onclick={() => openOverlay(product)}>{product.title}</button>
              <div class="card-rating">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span>{product.rating.rate.toFixed(1)}</span>
              </div>
              <span class="card-price">${product.price.toFixed(2)}</span>
              <div class="card-actions">
                <button class="primary card-btn" onclick={() => addToCart(product.id)}>ADD TO CART</button>
                <button class="card-fav" class:faved={favs.isFavorited(product.id)} onclick={() => toggleFav(product.id)}>
                  {#if favs.isFavorited(product.id)}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {:else}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {/if}
                </button>
              </div>
            </div>
          </div>
        {/each}
        <a href="/products?category={cat.name}" class="view-more">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>
          <span>View More</span>
        </a>
      </div>
    </section>
  {/each}

  <div style="text-align:center;padding:2rem 0;">
    <a href="/products"><button class="primary" style="padding:0.75rem 2rem;">Shop All Products</button></a>
  </div>
{/if}

<style>
  .hero { text-align:center; padding:3.5rem 0 1rem; }
  .hero h1 { font-size:2.25rem; font-weight:800; letter-spacing:-0.03em; }
  .hero p { color:var(--text-muted); margin-top:0.5rem; font-size:0.95rem; }

  .cat-section { padding:1.5rem 0; }
  .cat-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem; }
  .cat-title { font-size:1rem; font-weight:600; text-transform:capitalize; }
  .cat-viewall { font-size:0.75rem; font-weight:600; color:var(--primary); text-decoration:none; }
  .cat-viewall:hover { text-decoration:underline; }

  .cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:0.875rem; }

  .card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; transition:box-shadow 0.2s, transform 0.2s; display:flex; flex-direction:column; }
  .card:hover { box-shadow:var(--shadow-lg); transform:translateY(-2px); }

  .card-img { width:100%; border:none; border-radius:0; padding:1rem; background:var(--bg-alt); cursor:pointer; display:flex; align-items:center; justify-content:center; height:170px; }
  .card-img img { max-height:100%; max-width:100%; object-fit:contain; transition:transform 0.4s; }
  .card:hover .card-img img { transform:scale(1.06) rotate(-2deg); }

  .card-body { padding:0.65rem; display:flex; flex-direction:column; gap:0.2rem; flex:1; }
  .card-title { font-size:0.78rem; font-weight:600; color:var(--text); line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-decoration:none; text-align:left; background:none; border:none; padding:0; cursor:pointer; }
  .card-title:hover { color:var(--primary); }
  .card-rating { display:flex; align-items:center; gap:0.2rem; font-size:0.7rem; color:var(--text-muted); font-weight:500; }
  .card-price { font-size:0.9rem; font-weight:700; color:var(--text); }

  .card-actions { display:flex; gap:0.375rem; margin-top:0.3rem; }
  .card-btn { flex:1; font-size:0.6rem; font-weight:700; padding:0.35rem 0.5rem; letter-spacing:0.02em; white-space:nowrap; display:flex; align-items:center; justify-content:center; }

  .card-fav { width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center; background:var(--bg-alt); border:1px solid var(--border); border-radius:var(--radius); flex-shrink:0; cursor:pointer; transition:0.15s; }
  .card-fav:hover { border-color:var(--primary); color:var(--primary); }
  .card-fav.faved { background:var(--primary-light); border-color:var(--primary); color:var(--primary); }

  .view-more { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem; min-height:200px; border:2px dashed var(--border); border-radius:var(--radius-lg); color:var(--text-muted); font-size:0.85rem; font-weight:600; text-decoration:none; transition:border-color 0.2s, color 0.2s, background 0.2s; }
  .view-more:hover { border-color:var(--primary); color:var(--primary); background:var(--primary-light); }

  @media (max-width:768px) {
    .hero h1 { font-size:1.75rem; }
    .cat-grid { grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:0.65rem; }
    .card-img { height:130px; padding:0.75rem; }
    .card-title { font-size:0.65rem; }
    .card-price { font-size:0.75rem; }
    .card-btn { font-size:0.5rem; padding:0.25rem 0.4rem; }
    .card-fav { width:26px; height:26px; }
    .view-more { min-height:160px; font-size:0.75rem; }
  }

  @media (max-width:480px) {
    .cat-grid { grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:0.5rem; }
    .card-img { height:110px; padding:0.5rem; }
    .view-more { min-height:140px; }
  }
</style>
