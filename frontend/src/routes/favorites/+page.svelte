<script lang="ts">
  import { onMount } from 'svelte';
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import { getFavoritesStore } from '$lib/stores/favorites.svelte';
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { goto } from '$app/navigation';

  const auth = getAuthStore();
  const favs = getFavoritesStore();
  const cart = getCartStore();

  onMount(() => { if (!auth.isAuthenticated) goto('/auth/login'); });
</script>

<div class="page-header"><h1>My Favorites</h1></div>

{#if favs.items.length === 0}
  <div class="empty-state">
    <p>No favorites yet.</p>
    <a href="/products"><button class="primary" style="margin-top:1rem;">Browse Products</button></a>
  </div>
{:else}
  <div class="fav-grid">
    {#each favs.items as fav (fav.id)}
      <div class="fav-item">
        {#if fav.product}
          <div class="fav-item-img">
            <img src={fav.product.image} alt={fav.product.title} />
          </div>
          <div class="fav-item-body">
            <a href={`/products/${fav.product_id}`} class="fav-item-title">{fav.product.title}</a>
            <span class="fav-item-price">${fav.product.price.toFixed(2)}</span>
            <div class="fav-item-actions">
              <button class="primary" style="flex:1;font-size:0.8rem;font-weight:700;" onclick={() => cart.add(fav.product_id)}>ADD TO CART</button>
              <button class="secondary" style="font-size:0.8rem;" onclick={() => favs.remove(fav.product_id)}>REMOVE</button>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .fav-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem; padding:0.5rem 0; }
  .fav-item { display:flex; gap:1rem; padding:1rem; border:1px solid var(--border); border-radius:var(--radius-lg); background:var(--bg-card); }
  .fav-item-img { width:80px; height:80px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:var(--bg-alt); border-radius:var(--radius); }
  .fav-item-img img { max-height:100%; max-width:100%; object-fit:contain; }
  .fav-item-body { flex:1; display:flex; flex-direction:column; gap:0.25rem; }
  .fav-item-title { font-weight:600; font-size:0.85rem; color:var(--text); text-decoration:none; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .fav-item-title:hover { color:var(--primary); }
  .fav-item-price { font-weight:700; font-size:1rem; }
  .fav-item-actions { display:flex; gap:0.5rem; margin-top:auto; }
</style>
