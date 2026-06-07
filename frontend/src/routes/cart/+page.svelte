<script lang="ts">
  import { onMount } from 'svelte';
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { goto } from '$app/navigation';

  const auth = getAuthStore();
  const cart = getCartStore();

  onMount(() => { if (!auth.isAuthenticated) goto('/auth/login'); });

  function qtyMinus(item: { id: number; quantity: number }) {
    if (item.quantity <= 1) cart.remove(item.id);
    else cart.update(item.id, item.quantity - 1);
  }
  function qtyPlus(item: { id: number; quantity: number }) { cart.update(item.id, item.quantity + 1); }
</script>

<div class="page-header"><h1>Shopping Cart</h1></div>

{#if cart.items.length === 0}
  <div class="empty-state">
    <p>Your cart is empty.</p>
    <a href="/products"><button class="primary" style="margin-top:1rem;">Browse Products</button></a>
  </div>
{:else}
  <div class="cart-list">
    {#each cart.items as item (item.id)}
      <div class="cart-item">
        {#if item.product}
          <div class="cart-item-img">
            <img src={item.product.image} alt={item.product.title} />
          </div>
        {/if}
        <div class="cart-item-info">
          <a href={`/products/${item.product_id}`} class="cart-item-title">{item.product?.title ?? `Product #${item.product_id}`}</a>
          {#if item.product}
            <span class="cart-item-unit">${item.product.price.toFixed(2)} each</span>
          {/if}
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn btn-animate" onclick={() => qtyMinus(item)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
          </button>
          <span class="qty-val">{item.quantity}</span>
          <button class="qty-btn btn-animate" onclick={() => qtyPlus(item)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
        <span class="cart-item-total">${(item.product?.price ?? 0 * item.quantity).toFixed(2)}</span>
        <button class="cart-item-remove btn-animate" onclick={() => cart.remove(item.id)} title="Remove">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    {/each}
  </div>

  <div class="cart-summary">
    <span class="cart-total-label">Total: <strong>${cart.total.toFixed(2)}</strong></span>
    <button class="primary cart-checkout">Checkout (Demo)</button>
  </div>
{/if}

<style>
  .cart-list { display:flex; flex-direction:column; gap:0.75rem; padding:0.5rem 0; }
  .cart-item { display:flex; gap:1rem; align-items:center; padding:1rem; border:1px solid var(--border); border-radius:var(--radius-lg); background:var(--bg-card); }
  .cart-item-img { width:80px; height:80px; display:flex; align-items:center; justify-content:center; background:var(--bg-alt); border-radius:var(--radius); flex-shrink:0; }
  .cart-item-img img { max-height:100%; max-width:100%; object-fit:contain; }
  .cart-item-info { flex:1; display:flex; flex-direction:column; gap:0.15rem; }
  .cart-item-title { font-weight:600; font-size:0.9rem; color:var(--text); text-decoration:none; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden; }
  .cart-item-title:hover { color:var(--primary); }
  .cart-item-unit { color:var(--text-muted); font-size:0.8rem; }
  .cart-item-qty { display:flex; align-items:center; gap:0.375rem; }
  .qty-btn { width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center; font-size:1rem; background:var(--bg-alt); border:1px solid var(--border); border-radius:var(--radius); }
  .qty-btn:hover { border-color:var(--primary); color:var(--primary); }
  .qty-val { min-width:1.5rem; text-align:center; font-weight:600; font-size:0.9rem; }
  .cart-item-total { font-weight:700; min-width:80px; text-align:right; font-size:0.95rem; }
  .cart-item-remove { width:32px; height:32px; padding:0; display:flex; align-items:center; justify-content:center; font-size:0.8rem; background:transparent; border:1px solid var(--border); border-radius:var(--radius); color:var(--text-muted); flex-shrink:0; }
  .cart-item-remove:hover { border-color:var(--danger); color:var(--danger); }
  .cart-summary { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 0; border-top:2px solid var(--border); margin-top:0.5rem; }
  .cart-total-label { font-size:1.1rem; }
  .cart-total-label strong { font-size:1.3rem; }
  .cart-checkout { padding:0.75rem 2.5rem; font-size:0.9rem; font-weight:700; letter-spacing:0.04em; }
</style>
