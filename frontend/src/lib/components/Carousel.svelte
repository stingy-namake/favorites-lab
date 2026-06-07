<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { api } from '$lib/api';
  import type { Product } from '$lib/types';
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { getFavoritesStore } from '$lib/stores/favorites.svelte';
  import { getProductOverlay } from '$lib/stores/productOverlay.svelte';

  let { title = 'Featured' }: { title?: string } = $props();

  const auth = getAuthStore();
  const cart = getCartStore();
  const favs = getFavoritesStore();
  const overlay = getProductOverlay();

  let carouselProducts = $state<Product[]>([]);
  let allProducts = $state<Product[]>([]);
  let categories = $state<{ name: string; items: Product[] }[]>([]);
  let loading = $state(true);
  let current = $state(0);
  let interval: ReturnType<typeof setInterval> | null = null;

  let scrollEls = $state<Record<string, HTMLElement>>({});
  let scrollLeftState = $state<Record<string, boolean>>({});
  let scrollRightState = $state<Record<string, boolean>>({});

  function scrollCat(name: string, dir: number) {
    const el = scrollEls[name];
    if (!el) return;
    el.scrollBy({ left: dir * 212, behavior: 'smooth' });
  }

  function checkScroll(name: string) {
    const el = scrollEls[name];
    if (!el) return;
    scrollLeftState[name] = el.scrollLeft > 4;
    scrollRightState[name] = el.scrollLeft < el.scrollWidth - el.clientWidth - 4;
  }

  function registerCatScroll(node: HTMLElement, name: string) {
    scrollEls[name] = node;
    requestAnimationFrame(() => checkScroll(name));
    const handler = () => checkScroll(name);
    node.addEventListener('scroll', handler);
    return { destroy() { node.removeEventListener('scroll', handler); } };
  }

  $effect(() => {
    overlay.selectedProduct;
    if (overlay.selectedProduct) { stop(); }
    else if (!loading && carouselProducts.length > 0) { start(); }
  });

  onMount(async () => {
    try {
      const res = await api.products.list({ limit: 50 });
      allProducts = res.items;
      const sorted = [...res.items].sort((a, b) => b.rating.rate - a.rating.rate);
      carouselProducts = sorted.slice(0, 8);

      const map = new Map<string, Product[]>();
      for (const p of res.items) {
        if (!map.has(p.category)) map.set(p.category, []);
        map.get(p.category)!.push(p);
      }
      categories = Array.from(map.entries()).map(([name, items]) => ({ name, items }));
    } catch { /* ignore */ }
    loading = false;
    current = 0;
    start();
  });

  onDestroy(() => stop());

  function start() { stop(); interval = setInterval(next, 4000); }
  function stop() { if (interval) { clearInterval(interval); interval = null; } }

  function next() {
    if (carouselProducts.length === 0) return;
    current = (current + 1) % carouselProducts.length;
    start();
  }

  function prev() {
    if (carouselProducts.length === 0) return;
    current = (current - 1 + carouselProducts.length) % carouselProducts.length;
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
    overlay.open(p);
  }
</script>

{#if loading}
  <p class="empty-state">Loading...</p>
{:else if carouselProducts.length > 0}
  <div class="carousel-section">
    <h2>{title}</h2>
    <div class="carousel-wrap">
      {#each carouselProducts as product, i (product.id)}
        <div class="carousel-item" class:active={i === current}>
          <button class="carousel-img" onclick={() => openOverlay(product)}>
            <img src={product.image} alt={product.title} loading="lazy" />
          </button>
          <div class="carousel-overlay">
            <span class="carousel-cat">{product.category}</span>
            <button class="carousel-title" onclick={() => openOverlay(product)}>{product.title}</button>
            <div class="carousel-rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span>{product.rating.rate.toFixed(1)}</span>
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
      {#each carouselProducts as _, i}
        <button class="dot" class:active={i === current} onclick={() => goTo(i)} aria-label={`Slide ${i + 1}`}></button>
      {/each}
    </div>

    {#each categories as cat}
      <div class="cat-section">
        <div class="cat-header">
          <h3 class="cat-title">{cat.name}</h3>
          <a href="/categories/{cat.name}" class="cat-viewall">View all</a>
        </div>
        <div class="cat-scroll-wrap">
          {#if scrollLeftState[cat.name]}
            <div class="cat-gradient cat-gradient-left"></div>
            <button class="cat-arrow cat-arrow-left" onclick={() => scrollCat(cat.name, -1)} aria-label="Scroll left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 19-7-7 7-7"/></svg>
            </button>
          {/if}
          <div class="cat-scroll" use:registerCatScroll={cat.name}>
            {#each cat.items as product (product.id)}
              <div class="sc-card">
                <button class="sc-img" onclick={() => openOverlay(product)}>
                  <img src={product.image} alt={product.title} loading="lazy" />
                </button>
                <div class="sc-body">
                  <button class="sc-title" onclick={() => openOverlay(product)}>{product.title}</button>
                  <div class="sc-rating">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span>{product.rating.rate.toFixed(1)}</span>
                  </div>
                  <div class="sc-foot">
                    <span class="sc-price">${product.price.toFixed(2)}</span>
                    {#if auth.isAuthenticated}
                      <button class="primary sc-btn" onclick={() => addToCart(product.id)}>ADD TO CART</button>
                    {/if}
                  </div>
                </div>
                {#if auth.isAuthenticated}
                  <button class="sc-fav" class:faved={favs.isFavorited(product.id)} onclick={() => toggleFav(product.id)}>
                    {#if favs.isFavorited(product.id)}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {:else}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {/if}
                  </button>
                {/if}
              </div>
            {/each}
          </div>
          {#if scrollRightState[cat.name]}
            <div class="cat-gradient cat-gradient-right"></div>
            <button class="cat-arrow cat-arrow-right" onclick={() => scrollCat(cat.name, 1)} aria-label="Scroll right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 5 7 7-7 7"/></svg>
            </button>
          {/if}
        </div>
      </div>
    {/each}

    <div style="text-align:center;padding-top:2rem;">
      <a href="/products"><button class="primary" style="padding:0.75rem 2rem;">Shop All Products</button></a>
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

  .cat-section { padding-top:1.5rem; }
  .cat-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem; }
  .cat-title { font-size:1rem; font-weight:600; text-transform:capitalize; }
  .cat-viewall { font-size:0.75rem; font-weight:600; color:var(--primary); text-decoration:none; }
  .cat-viewall:hover { text-decoration:underline; }
  .cat-scroll-wrap { position:relative; display:flex; align-items:center; gap:0.5rem; }
  .cat-scroll { display:flex; gap:0.75rem; overflow-x:auto; padding:0.25rem 0 0.5rem; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; flex:1; scrollbar-width:none; -ms-overflow-style:none; }
  .cat-scroll::-webkit-scrollbar { display:none; }

  .sc-card { flex-shrink:0; width:200px; background:var(--bg-card); border-radius:var(--radius-lg); overflow:hidden; transition:transform 0.2s, box-shadow 0.2s; position:relative; scroll-snap-align:start; display:flex; flex-direction:column; }
  .sc-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-lg); }
  .sc-img { display:flex; align-items:center; justify-content:center; padding:0.85rem; height:170px; background:var(--bg-alt); overflow:hidden; border:none; border-radius:0; cursor:pointer; width:100%; }
  .sc-img img { max-height:100%; max-width:100%; object-fit:contain; transition:transform 0.4s; }
  .sc-card:hover .sc-img img { transform:scale(1.06) rotate(-2deg); }
  .sc-body { padding:0.65rem; display:flex; flex-direction:column; gap:0.2rem; justify-content:space-between; flex:1; }
  .sc-title { font-size:0.78rem; font-weight:600; color:var(--text); line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-decoration:none; text-align:left; background:none; border:none; padding:0; cursor:pointer; }
  .sc-title:hover { color:var(--primary); }
  .sc-rating { display:flex; align-items:center; gap:0.2rem; font-size:0.7rem; color:var(--text-muted); font-weight:500; }
  .sc-foot { display:flex; align-items:center; justify-content:space-between; margin-top:0.3rem; gap:0.4rem; }
  .sc-price { font-size:0.9rem; font-weight:700; color:var(--text); white-space:nowrap; }
  .sc-btn { font-size:0.6rem; font-weight:700; padding:0.3rem 0.6rem; letter-spacing:0.02em; white-space:nowrap; display:flex; align-items:center; justify-content:center; }
  .cat-arrow { flex-shrink:0; width:32px; height:32px; padding:0; display:flex; align-items:center; justify-content:center; background:var(--bg-card); border:1px solid var(--border); border-radius:50%; color:var(--text); cursor:pointer; transition:0.15s; box-shadow:var(--shadow); z-index:1; }
  .cat-arrow:hover { background:var(--primary); color:var(--primary-text, white); border-color:var(--primary); }
  .cat-gradient { position:absolute; top:0; bottom:0; width:120px; pointer-events:none; z-index:1; }
  .cat-gradient-left { left:0; background:linear-gradient(to right, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%); }
  .cat-gradient-right { right:0; background:linear-gradient(to left, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%); }

  .sc-fav { position:absolute; top:0.3rem; right:0.3rem; width:24px; height:24px; padding:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); border:none; border-radius:50%; color:white; cursor:pointer; opacity:0; transition:opacity 0.2s; }
  .sc-card:hover .sc-fav { opacity:1; }
  .sc-fav.faved { opacity:1; background:var(--primary-light); color:var(--primary); }

  @media (max-width:768px) {
    .carousel-wrap { height:280px; }
    .carousel-item { padding:0 2.5rem; }
    .carousel-img { width:35%; padding:1rem; }
    .carousel-overlay { padding:1rem; }
    .carousel-title { font-size:1rem; }
    .carousel-price { font-size:1.25rem; }
    .carousel-btn { font-size:0.65rem; padding:0.4rem 0.9rem; }
    .carousel-desc { font-size:0.75rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .sc-card { width:165px; }
    .sc-img { height:132px; padding:0.6rem; }
    .sc-title { font-size:0.65rem; }
    .sc-price { font-size:0.75rem; }
    .sc-btn { font-size:0.5rem; padding:0.2rem 0.45rem; }
    .cat-arrow { width:28px; height:28px; }
  }

  @media (max-width:480px) {
    .carousel-wrap { height:240px; }
    .carousel-item { padding:0 2rem; }
    .carousel-img { display:none; }
    .carousel-overlay { padding:0.75rem; }
    .carousel-title { font-size:0.9rem; }
    .carousel-price { font-size:1.1rem; }
    .sc-card { width:145px; }
    .sc-img { height:110px; padding:0.5rem; }
  }
</style>
