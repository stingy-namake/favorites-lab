<script lang="ts">
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { goto } from '$app/navigation';

  let { open, onclose }: { open: boolean; onclose: () => void } = $props();

  const cart = getCartStore();

  function slideRight(node: Element, { duration = 200 }) {
    return { duration, css: (t: number) => `transform:translateX(${(1-t)*100}%);opacity:${t};overflow:hidden;` };
  }

  function qtyMinus(item: { id: number; quantity: number }) {
    if (item.quantity <= 1) cart.remove(item.id);
    else cart.update(item.id, item.quantity - 1);
  }
  function qtyPlus(item: { id: number; quantity: number }) {
    cart.update(item.id, item.quantity + 1);
  }
  function goToCart() {
    onclose();
    goto('/cart');
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={onclose}></div>
{/if}
<div class="panel" class:open>
  <div class="panel-header">
    <h2>Cart ({cart.count})</h2>
    <button class="panel-close" onclick={onclose}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <div class="panel-body">
    {#each cart.items as item (item.id)}
      <div class="panel-item" transition:slideRight>
        {#if item.product}
          <div class="panel-item-img">
            <img src={item.product.image} alt={item.product.title} />
          </div>
        {/if}
        <div class="panel-item-info">
          <span class="panel-item-title">{item.product?.title ?? `Product #${item.product_id}`}</span>
          <div class="panel-item-qty">
            <button class="qty-btn btn-animate" onclick={() => qtyMinus(item)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
            </button>
            <span class="qty-val">{item.quantity}</span>
            <button class="qty-btn btn-animate" onclick={() => qtyPlus(item)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
            <button class="qty-trash btn-animate" onclick={() => cart.remove(item.id)} title="Remove">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        <span class="panel-item-price">${(item.product?.price ?? 0).toFixed(2)}</span>
      </div>
    {/each}
    {#if cart.items.length === 0}
      <p class="panel-empty">Your cart is empty.</p>
    {/if}
  </div>
  {#if cart.items.length > 0}
    <div class="panel-footer">
      <div class="panel-total">
        <span>Total</span>
        <strong>${cart.total.toFixed(2)}</strong>
      </div>
      <button class="primary panel-checkout" onclick={goToCart}>GO TO CART</button>
    </div>
  {/if}
</div>

<style>
  .backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:200; }
  .panel { position:fixed; top:0; right:0; bottom:0; width:360px; max-width:90vw; background:var(--bg-card); z-index:201; display:flex; flex-direction:column; transform:translateX(100%); transition:transform 0.25s ease; box-shadow:var(--shadow-lg); }
  .panel.open { transform:translateX(0); }
  .panel-header { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.25rem; border-bottom:1px solid var(--border); }
  .panel-header h2 { font-size:1rem; }
  .panel-close { width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center; background:var(--bg-alt); border:1px solid var(--border); border-radius:var(--radius); color:var(--text); }
  .panel-close:hover { border-color:var(--primary); color:var(--primary); }
  .panel-body { flex:1; overflow-y:auto; padding:0.75rem 1.25rem; display:flex; flex-direction:column; gap:0.75rem; }
  .panel-empty { color:var(--text-muted); text-align:center; padding:2rem 0; font-size:0.9rem; }
  .panel-item { display:flex; gap:0.75rem; align-items:center; }
  .panel-item-img { width:56px; height:56px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:var(--bg-alt); border-radius:var(--radius); }
  .panel-item-img img { max-height:100%; max-width:100%; object-fit:contain; }
  .panel-item-info { flex:1; display:flex; flex-direction:column; gap:0.35rem; min-width:0; }
  .panel-item-title { font-size:0.8rem; font-weight:500; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .panel-item-qty { display:flex; align-items:center; gap:0.25rem; }
  .qty-btn { width:26px; height:26px; padding:0; display:flex; align-items:center; justify-content:center; background:var(--bg-alt); border:1px solid var(--border); border-radius:var(--radius); color:var(--text); }
  .qty-btn:hover { border-color:var(--primary); color:var(--primary); }
  .qty-trash { width:26px; height:26px; padding:0; display:flex; align-items:center; justify-content:center; background:transparent; border:1px solid var(--border); border-radius:var(--radius); color:var(--text-muted); margin-left:0.15rem; }
  .qty-trash:hover { border-color:var(--danger); color:var(--danger); }
  .qty-val { min-width:1.25rem; text-align:center; font-weight:600; font-size:0.85rem; }
  .panel-item-price { font-weight:700; font-size:0.85rem; color:var(--text); white-space:nowrap; }
  .panel-footer { padding:1rem 1.25rem; border-top:1px solid var(--border); display:flex; flex-direction:column; gap:0.75rem; }
  .panel-total { display:flex; justify-content:space-between; font-size:0.9rem; }
  .panel-total strong { font-size:1.1rem; }
  .panel-checkout { width:100%; padding:0.75rem; font-weight:700; letter-spacing:0.04em; }
</style>
