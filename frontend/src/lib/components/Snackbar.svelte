<script lang="ts">
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { fade, slide } from 'svelte/transition';

  const cart = getCartStore();
</script>

{#if cart.lastRemoved}
  <div class="snackbar" transition:slide={{ duration: 250 }}>
    <span class="snackbar-msg">Item removed from cart</span>
    <button class="snackbar-undo" onclick={() => cart.undoRemove()}>Undo</button>
    <button class="snackbar-dismiss" onclick={() => cart.dismissUndo()}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>
{/if}

<style>
  .snackbar { position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%); z-index:300; display:flex; align-items:center; gap:0.75rem; background:var(--text); color:var(--bg); padding:0.75rem 1.25rem; border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); font-size:0.875rem; }
  .snackbar-msg { font-weight:500; }
  .snackbar-undo { background:transparent; border:none; color:var(--primary); font-weight:700; font-size:0.8rem; padding:0.25rem 0.5rem; cursor:pointer; }
  .snackbar-undo:hover { text-decoration:underline; }
  .snackbar-dismiss { background:transparent; border:none; color:var(--text-muted); padding:0.25rem; cursor:pointer; display:flex; align-items:center; }
  .snackbar-dismiss:hover { color:var(--text); }
</style>
