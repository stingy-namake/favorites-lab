<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
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
  let virtualIdx = $state(0);
  let offset = $state(0);
  let interval: ReturnType<typeof setInterval> | null = null;
  let visible = $state(5);
  let wrap: HTMLDivElement | undefined = $state(undefined);
  let noTrans = $state(false);

  const CARD_GAP = 16;
  let displayProducts: Product[] = [];
  let currentIdx = $state(0);

  function rebuildDisplay() {
    const off = offset || visible;
    displayProducts = [...products.slice(-off), ...products, ...products.slice(0, off)];
  }

  onMount(async () => {
    try {
      const all = await api.products.list({ limit: 50 });
      products = all.items.sort((a, b) => b.rating.rate - a.rating.rate).slice(0, 10);
    } catch { /* ignore */ }
    offset = visible;
    virtualIdx = offset;
    rebuildDisplay();
    loading = false;
    start();
  });

  onDestroy(() => stop());

  $effect(() => {
    if (!products.length || !offset) return;
    const prev = currentIdx;
    currentIdx = ((virtualIdx - offset) % products.length + products.length) % products.length;
  });

  $effect(() => {
    if (!wrap) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      const v = w < 560 ? 2 : w < 800 ? 3 : w < 1100 ? 4 : 5;
      if (v !== visible) {
        visible = v;
        if (products.length) {
          offset = visible;
          virtualIdx = offset;
          rebuildDisplay();
        }
      }
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  });

  function start() { stop(); interval = setInterval(next, 4000); }
  function stop() { if (interval) { clearInterval(interval); interval = null; } }

  async function next() {
    virtualIdx++;
    await tick();
    if (virtualIdx >= products.length + offset) snap(offset);
  }

  async function prev() {
    virtualIdx--;
    await tick();
    if (virtualIdx < offset) snap(offset + products.length - 1);
  }

  async function snap(to: number) {
    noTrans = true;
    virtualIdx = to;
    await tick();
    noTrans = false;
  }

  function goTo(i: number) {
    virtualIdx = offset + i;
    start();
  }

  let slideW = $state(0);
  $effect(() => {
    if (!wrap) return;
    const updateWidth = () => {
      slideW = (wrap!.getBoundingClientRect().width - CARD_GAP * (visible - 1)) / visible;
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(wrap);
    return () => ro.disconnect();
  });

  let dotArr: number[] = [];
  $effect(() => { dotArr = Array.from({ length: products.length || 0 }, (_, i) => i); });

  function addToCart(id: number) { if (auth.isAuthenticated) cart.add(id); }
  function toggleFav(id: number) {
    if (!auth.isAuthenticated) return;
    if (favs.isFavorited(id)) favs.remove(id);
    else favs.add(id);
  }
</script>

{#if loading}
  <p class="empty-state">Loading...</p>
{:else if products.length > 0}
  <div class="carousel" bind:this={wrap}>
    <div class="carousel-head">
      <h2>{title}</h2>
      <div class="carousel-arrows">
        <button class="arr" onclick={prev} aria-label="Previous">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button class="arr" onclick={next} aria-label="Next">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
    <div class="track-wrap">
      <div class="track" class:no-trans={noTrans} style="transform:translateX(-{virtualIdx * (slideW + CARD_GAP)}px)" onmouseenter={stop} onmouseleave={start}>
        {#each displayProducts as product, i (i)}
          <div class="slide" style="width:{slideW}px" class:active={product.id === products[currentIdx]?.id}>
            <div class="card">
              <a href={`/products/${product.id}`} class="card-img">
                <img src={product.image} alt={product.title} loading="lazy" />
              </a>
              <div class="card-body">
                <span class="card-cat">{product.category}</span>
                <a href={`/products/${product.id}`} class="card-title">{product.title}</a>
                <div class="card-rating">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span>{product.rating.rate}</span>
                </div>
                <p class="card-desc">{product.description.slice(0, 80)}{product.description.length > 80 ? '…' : ''}</p>
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
          </div>
        {/each}
      </div>
    </div>
    <div class="dots">
      {#each dotArr as _, i}
        <button class="dot" class:active={i === currentIdx} onclick={() => goTo(i)} aria-label={`Slide ${i + 1}`}></button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .carousel { padding:1.5rem 0; }

  .carousel-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
  .carousel-head h2 { font-size:1.25rem; font-weight:700; }

  .carousel-arrows { display:flex; gap:0.375rem; }
  .arr { width:32px; height:32px; padding:0; display:flex; align-items:center; justify-content:center; background:var(--bg-alt); border:1px solid var(--border); border-radius:50%; color:var(--text); cursor:pointer; transition:0.15s; }
  .arr:hover { border-color:var(--primary); color:var(--primary); }

  .track-wrap { overflow:hidden; }
  .track { display:flex; gap:16px; transition:transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change:transform; }
  .track.no-trans { transition:none; }
  .slide { flex-shrink:0; transition:transform 0.3s; position:relative; z-index:1; }
  .slide.active { z-index:2; }
  .slide.active .card { transform:scale(1.15); box-shadow:var(--shadow-lg); }

  .card { background:var(--bg-card); border-radius:var(--radius-lg); overflow:hidden; transition:transform 0.3s, box-shadow 0.3s; position:relative; }
  .card:hover { transform:translateY(-4px) scale(1.02); box-shadow:var(--shadow-lg); }
  .slide.active .card:hover { transform:scale(1.18); }

  .card-img { display:flex; align-items:center; justify-content:center; padding:1.5rem; height:180px; background:var(--bg-alt); overflow:hidden; }
  .card-img img { max-height:100%; max-width:100%; object-fit:contain; transition:transform 0.4s; }
  .card:hover .card-img img { transform:scale(1.08) rotate(-3deg); }

  .card-body { padding:0.75rem; display:flex; flex-direction:column; gap:0.3rem; }
  .card-cat { font-size:0.65rem; font-weight:600; color:var(--primary); text-transform:uppercase; letter-spacing:0.06em; }
  .card-title { font-size:0.82rem; font-weight:600; color:var(--text); line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-decoration:none; }
  .card-title:hover { color:var(--primary); }
  .card-rating { display:flex; align-items:center; gap:0.25rem; font-size:0.75rem; color:var(--text-muted); font-weight:500; }
  .card-desc { font-size:0.72rem; color:var(--text-muted); line-height:1.4; }
  .card-foot { display:flex; align-items:center; justify-content:space-between; margin-top:0.15rem; gap:0.5rem; }
  .card-price { font-size:1rem; font-weight:700; color:var(--text); white-space:nowrap; }
  .card-btn { font-size:0.65rem; font-weight:700; padding:0.35rem 0.75rem; letter-spacing:0.03em; white-space:nowrap; }

  .card-fav { position:absolute; top:0.5rem; right:0.5rem; width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); border:none; border-radius:50%; color:white; cursor:pointer; opacity:0; transition:opacity 0.2s; }
  .card:hover .card-fav { opacity:1; }
  .card-fav.faved { opacity:1; background:var(--primary-light); color:var(--primary); }

  .dots { display:flex; justify-content:center; gap:0.4rem; padding:1rem 0 0; }
  .dot { width:8px; height:8px; padding:0; border-radius:50%; border:1px solid var(--border); background:var(--bg-alt); cursor:pointer; transition:0.15s; }
  .dot.active { background:var(--primary); border-color:var(--primary); }
</style>
