<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { api } from '$lib/api';
  import type { Product } from '$lib/types';
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { getFavoritesStore } from '$lib/stores/favorites.svelte';

  let { title = 'Featured' }: { title?: string } = $props();

  const auth = getAuthStore();
  const cart = getCartStore();
  const favs = getFavoritesStore();

  let products = $state<Product[]>([]);
  let loading = $state(true);
  let current = $state(0);
  let interval: ReturnType<typeof setInterval> | null = null;
  let selectedProduct = $state<Product | null>(null);

  onMount(async () => {
    try {
      const all = await api.products.list({ limit: 50 });
      products = all.items.sort((a, b) => b.rating.rate - a.rating.rate).slice(0, 8);
    } catch { /* ignore */ }
    loading = false;
    start();
  });

  onDestroy(() => stop());

  function start() { stop(); interval = setInterval(next, 4000); }
  function stop() { if (interval) { clearInterval(interval); interval = null; } }

  function next() {
    current = (current + 1) % products.length;
    start();
  }

  function prev() {
    current = (current - 1 + products.length) % products.length;
    start();
  }

  function goTo(i: number) {
    current = i;
    start();
  }

  function addToCart(id: number) { if (auth.isAuthenticated) cart.add(id); }
  function toggleFav(id: number) {
    if (!auth.isAuthenticated) return;
    if (favs.isFavorited(id)) favs.remove(id);
    else favs.add(id);
  }

  function openOverlay(p: Product) {
    selectedProduct = p;
    stop();
  }

  function closeOverlay() {
    selectedProduct = null;
    start();
  }
</script>

{#if loading}
  <p class="empty-state">Loading...</p>
{:else if products.length > 0}
  <div class="carousel-section">
    <h2>{title}</h2>
    <div class="carousel-wrap">
      {#each products as product, i (product.id)}
        <div class="carousel-item" class:active={i === current}>
          <button class="carousel-img" onclick={() => openOverlay(product)}>
            <img src={product.image} alt={product.title} loading="lazy" />
          </button>
          <div class="carousel-overlay">
            <span class="carousel-cat">{product.category}</span>
            <button class="carousel-title" onclick={() => openOverlay(product)}>{product.title}</button>
            <div class="carousel-rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span>{product.rating.rate}</span>
            </div>
            <p class="carousel-desc">{product.description.slice(0, 120)}{product.description.length > 120 ? '…' : ''}</p>
            <div class="carousel-foot">
              <span class="carousel-price">${product.price.toFixed(2)}</span>
              {#if auth.isAuthenticated}
                <button class="primary carousel-btn" onclick={() => addToCart(product.id)}>ADD TO CART</button>
              {/if}
            </div>
          </div>
          {#if auth.isAuthenticated}
            <button class="carousel-fav" class:faved={favs.isFavorited(product.id)} onclick={() => toggleFav(product.id)}>
              {#if favs.isFavorited(product.id)}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {:else}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {/if}
            </button>
          {/if}
        </div>
      {/each}

      <button class="carousel-arrow carousel-arrow-left" onclick={prev} aria-label="Previous">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 19-7-7 7-7"/></svg>
      </button>
      <button class="carousel-arrow carousel-arrow-right" onclick={next} aria-label="Next">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 5 7 7-7 7"/></svg>
      </button>
    </div>

    <div class="carousel-dots">
      {#each products as _, i}
        <button class="dot" class:active={i === current} onclick={() => goTo(i)} aria-label={`Slide ${i + 1}`}></button>
      {/each}
    </div>

    <div class="product-grid">
      {#each products as product (product.id)}
        <div class="card">
          <button class="card-img" onclick={() => openOverlay(product)}>
            <img src={product.image} alt={product.title} loading="lazy" />
          </button>
          <div class="card-body">
            <span class="card-cat">{product.category}</span>
            <button class="card-title" onclick={() => openOverlay(product)}>{product.title}</button>
            <div class="card-rating">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span>{product.rating.rate}</span>
            </div>
            <div class="card-foot">
              <span class="card-price">${product.price.toFixed(2)}</span>
              {#if auth.isAuthenticated}
                <button class="primary card-btn" onclick={() => addToCart(product.id)}>ADD TO CART</button>
              {/if}
            </div>
          </div>
          {#if auth.isAuthenticated}
            <button class="card-fav" class:faved={favs.isFavorited(product.id)} onclick={() => toggleFav(product.id)}>
              {#if favs.isFavorited(product.id)}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {:else}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {/if}
            </button>
          {/if}
        </div>
      {/each}
    </div>

    <div style="text-align:center;padding-top:2rem;">
      <a href="/products"><button class="primary" style="padding:0.75rem 2rem;">Shop All Products</button></a>
    </div>
  </div>
{/if}

{#if selectedProduct}
  <div class="overlay" onclick={closeOverlay}>
    <div class="overlay-content" onclick={(e) => e.stopPropagation()}>
      <button class="overlay-close" onclick={closeOverlay}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <div class="overlay-layout">
        <div class="overlay-img">
          <img src={selectedProduct.image} alt={selectedProduct.title} />
        </div>
        <div class="overlay-info">
          <span class="overlay-cat">{selectedProduct.category}</span>
          <h2 class="overlay-title">{selectedProduct.title}</h2>
          <div class="overlay-rating">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span>{selectedProduct.rating.rate}</span>
            <span class="overlay-count">({selectedProduct.rating.count} reviews)</span>
          </div>
          <p class="overlay-desc">{selectedProduct.description}</p>
          <div class="overlay-foot">
            <span class="overlay-price">${selectedProduct.price.toFixed(2)}</span>
            {#if auth.isAuthenticated}
              <button class="primary overlay-btn" onclick={() => addToCart(selectedProduct.id)}>ADD TO CART</button>
              <button class="overlay-fav-btn" class:faved={favs.isFavorited(selectedProduct.id)} onclick={() => toggleFav(selectedProduct.id)}>
                {#if favs.isFavorited(selectedProduct.id)}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {:else}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {/if}
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .carousel-section { padding:1.5rem 0; }
  .carousel-section h2 { font-size:1.25rem; font-weight:700; margin-bottom:1rem; }

  .carousel-wrap { position:relative; border-radius:var(--radius-lg); overflow:hidden; background:var(--bg-card); height:340px; }

  .carousel-item { position:absolute; top:0; left:0; width:100%; height:100%; padding:0 3.5rem; display:flex; opacity:0; transform:translateY(10px); transition:opacity 0.4s ease, transform 0.4s ease; pointer-events:none; }
  .carousel-item.active { position:relative; opacity:1; transform:translateY(0); pointer-events:auto; }

  .carousel-img { width:40%; flex-shrink:0; display:flex; align-items:center; justify-content:center; padding:2rem; background:var(--bg-alt); border:none; border-radius:0; cursor:pointer; }
  .carousel-img img { max-height:280px; max-width:100%; object-fit:contain; }

  .carousel-overlay { flex:1; padding:2rem; display:flex; flex-direction:column; gap:0.5rem; justify-content:center; }
  .carousel-cat { font-size:0.7rem; font-weight:600; color:var(--primary); text-transform:uppercase; letter-spacing:0.06em; }
  .carousel-title { font-size:1.25rem; font-weight:700; color:var(--text); line-height:1.3; text-decoration:none; text-align:left; background:none; border:none; padding:0; cursor:pointer; }
  .carousel-title:hover { color:var(--primary); }
  .carousel-rating { display:flex; align-items:center; gap:0.3rem; font-size:0.85rem; color:var(--text-muted); font-weight:500; }
  .carousel-desc { font-size:0.85rem; color:var(--text-muted); line-height:1.5; }
  .carousel-foot { display:flex; align-items:center; gap:1rem; margin-top:0.5rem; }
  .carousel-price { font-size:1.5rem; font-weight:800; color:var(--text); }
  .carousel-btn { font-size:0.75rem; font-weight:700; padding:0.5rem 1.25rem; letter-spacing:0.03em; }

  .carousel-fav { position:absolute; top:0.75rem; right:0.75rem; width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); border:none; border-radius:50%; color:white; cursor:pointer; transition:opacity 0.2s; opacity:0; z-index:2; }
  .carousel-item:hover .carousel-fav { opacity:1; }
  .carousel-fav.faved { opacity:1; background:var(--primary-light); color:var(--primary); }

  .carousel-arrow { position:absolute; top:50%; transform:translateY(-50%); z-index:10; width:40px; height:40px; padding:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); border:none; border-radius:50%; color:white; cursor:pointer; transition:background 0.15s; }
  .carousel-arrow:hover { background:rgba(0,0,0,0.75); }
  .carousel-arrow-left { left:1rem; }
  .carousel-arrow-right { right:1rem; }

  .carousel-dots { display:flex; justify-content:center; gap:0.5rem; padding-top:0.75rem; }
  .dot { width:10px; height:10px; padding:0; border-radius:50%; border:2px solid var(--border); background:transparent; cursor:pointer; transition:0.15s; }
  .dot.active { background:var(--primary); border-color:var(--primary); }

  .product-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1rem; padding-top:2rem; }

  .card { background:var(--bg-card); border-radius:var(--radius-lg); overflow:hidden; transition:transform 0.2s, box-shadow 0.2s; position:relative; display:flex; flex-direction:column; }
  .card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); }
  .card-img { display:flex; align-items:center; justify-content:center; padding:1rem; height:160px; background:var(--bg-alt); overflow:hidden; border:none; border-radius:0; cursor:pointer; width:100%; }
  .card-img img { max-height:100%; max-width:100%; object-fit:contain; transition:transform 0.4s; }
  .card:hover .card-img img { transform:scale(1.08) rotate(-3deg); }
  .card-body { padding:0.65rem; display:flex; flex-direction:column; gap:0.25rem; flex:1; }
  .card-cat { font-size:0.6rem; font-weight:600; color:var(--primary); text-transform:uppercase; letter-spacing:0.06em; }
  .card-title { font-size:0.78rem; font-weight:600; color:var(--text); line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-decoration:none; text-align:left; background:none; border:none; padding:0; cursor:pointer; }
  .card-title:hover { color:var(--primary); }
  .card-rating { display:flex; align-items:center; gap:0.2rem; font-size:0.7rem; color:var(--text-muted); font-weight:500; margin-top:auto; }
  .card-foot { display:flex; align-items:center; justify-content:space-between; margin-top:0.5rem; gap:0.5rem; }
  .card-price { font-size:0.9rem; font-weight:700; color:var(--text); white-space:nowrap; }
  .card-btn { font-size:0.6rem; font-weight:700; padding:0.3rem 0.65rem; letter-spacing:0.03em; white-space:nowrap; }
  .card-fav { position:absolute; top:0.4rem; right:0.4rem; width:28px; height:28px; padding:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); border:none; border-radius:50%; color:white; cursor:pointer; opacity:0; transition:opacity 0.2s; }
  .card:hover .card-fav { opacity:1; }
  .card-fav.faved { opacity:1; background:var(--primary-light); color:var(--primary); }

  .overlay { position:fixed; inset:0; z-index:1000; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; padding:1rem; }
  .overlay-content { background:var(--bg-card); border-radius:var(--radius-lg); max-width:800px; width:100%; max-height:90vh; overflow-y:auto; position:relative; padding:2rem; }
  .overlay-close { position:absolute; top:0.75rem; right:0.75rem; width:32px; height:32px; padding:0; display:flex; align-items:center; justify-content:center; background:var(--bg-alt); border:1px solid var(--border); border-radius:50%; color:var(--text); cursor:pointer; z-index:2; }
  .overlay-close:hover { background:var(--border); }
  .overlay-layout { display:flex; gap:2rem; }
  .overlay-img { width:35%; flex-shrink:0; display:flex; align-items:center; justify-content:center; padding:1rem; background:var(--bg-alt); border-radius:var(--radius); }
  .overlay-img img { max-height:220px; max-width:100%; object-fit:contain; }
  .overlay-info { flex:1; display:flex; flex-direction:column; gap:0.75rem; }
  .overlay-cat { font-size:0.75rem; font-weight:600; color:var(--primary); text-transform:uppercase; letter-spacing:0.06em; }
  .overlay-title { font-size:1.35rem; font-weight:700; line-height:1.3; }
  .overlay-rating { display:flex; align-items:center; gap:0.3rem; font-size:0.9rem; color:var(--text-muted); font-weight:500; }
  .overlay-count { font-size:0.8rem; }
  .overlay-desc { font-size:0.9rem; color:var(--text-muted); line-height:1.6; }
  .overlay-foot { display:flex; align-items:center; gap:0.75rem; margin-top:0.5rem; }
  .overlay-price { font-size:1.75rem; font-weight:800; color:var(--text); }
  .overlay-btn { font-size:0.8rem; font-weight:700; padding:0.6rem 1.5rem; letter-spacing:0.03em; }
  .overlay-fav-btn { width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; background:var(--bg-alt); border:1px solid var(--border); border-radius:50%; color:var(--text-muted); cursor:pointer; transition:0.15s; }
  .overlay-fav-btn:hover { border-color:var(--danger); color:var(--danger); }
  .overlay-fav-btn.faved { background:var(--primary-light); color:var(--primary); border-color:var(--primary); }
</style>
