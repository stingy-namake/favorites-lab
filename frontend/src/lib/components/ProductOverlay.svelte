<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { getProductOverlay } from '$lib/stores/productOverlay.svelte';
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { getFavoritesStore } from '$lib/stores/favorites.svelte';

  const overlay = getProductOverlay();
  const auth = getAuthStore();
  const cart = getCartStore();
  const favs = getFavoritesStore();

  let p = $derived(overlay.selectedProduct);

  function close() { overlay.close(); }
  function addToCart(id: number) { if (auth.isAuthenticated) cart.add(id); }
  function toggleFav(id: number) {
    if (!auth.isAuthenticated) return;
    if (favs.isFavorited(id)) favs.remove(id);
    else favs.add(id);
  }
</script>

{#if p}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" transition:fade={{ duration: 150 }} onclick={close}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="overlay-content" transition:scale={{ start: 0.95, duration: 150 }} onclick={(e) => e.stopPropagation()}>
      <button class="overlay-close" onclick={close} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <div class="overlay-layout">
        <div class="overlay-img">
          <img src={p.image} alt={p.title} />
        </div>
        <div class="overlay-info">
          <span class="overlay-cat">{p.category}</span>
          <h2 class="overlay-title">{p.title}</h2>
          <div class="overlay-rating">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span>{p.rating.rate.toFixed(1)}</span>
            <span class="overlay-count">({p.rating.count} reviews)</span>
          </div>
          <p class="overlay-desc">{p.description}</p>
          <div class="overlay-foot">
            <span class="overlay-price">${p.price.toFixed(2)}</span>
            {#if auth.isAuthenticated}
              <button class="primary overlay-btn" onclick={() => addToCart(p.id)}>ADD TO CART</button>
              <button class="overlay-fav-btn" class:faved={favs.isFavorited(p.id)} onclick={() => toggleFav(p.id)}>
                {#if favs.isFavorited(p.id)}
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

  @media (max-width:768px) {
    .overlay-layout { flex-direction:column; gap:1rem; }
    .overlay-img { width:100%; }
    .overlay-title { font-size:1.1rem; }
    .overlay-price { font-size:1.25rem; }
    .overlay-desc { font-size:0.8rem; }
  }
</style>
