<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import type { Product } from '$lib/types';

  let products = $state<Product[]>([]);
  let categories = $state<string[]>([]);
  let page = $state(1);
  let totalPages = $state(1);
  let total = $state(0);
  let selectedCategory = $state('');
  let search = $state('');
  let loading = $state(true);
  const LIMIT = 12;

  onMount(async () => {
    try { categories = await api.products.categories(); } catch {}
    await loadPage(1);
  });

  async function loadPage(p: number) {
    loading = true;
    page = p;
    try {
      const res = await api.products.list({ page: p, limit: LIMIT, category: selectedCategory || undefined, q: search || undefined });
      products = res.items;
      totalPages = res.totalPages;
      total = res.total;
    } catch { /* ignore */ }
    loading = false;
  }

  function filterCategory(cat: string) { selectedCategory = cat; loadPage(1); }
  function handleSearch(e: Event) { search = (e.target as HTMLInputElement).value; loadPage(1); }
</script>

<div class="page-header">
  <h1>Products</h1>
  <span style="color:var(--text-muted);font-size:0.9rem;">{total} products found</span>
</div>

<div class="filter-bar">
  <input placeholder="Search..." value={search} oninput={handleSearch} style="max-width:250px;" />
  <button class={selectedCategory === '' ? 'primary' : 'secondary'} onclick={() => filterCategory('')}>All</button>
  {#each categories as cat}
    <button class={selectedCategory === cat ? 'primary' : 'secondary'} onclick={() => filterCategory(cat)}>{cat}</button>
  {/each}
</div>

{#if loading}
  <p class="empty-state">Loading...</p>
{:else if products.length === 0}
  <p class="empty-state">No products match your search. <a href="/products">Clear filters</a></p>
{:else}
  <div class="product-grid">
    {#each products as product}
      <ProductCard {product} />
    {/each}
  </div>
{/if}

<div class="pagination">
  <button class="secondary" disabled={page <= 1} onclick={() => loadPage(page - 1)}>← Previous</button>
  <span style="color:var(--text-muted);font-size:0.875rem;">Page {page} of {totalPages}</span>
  <button class="secondary" disabled={page >= totalPages} onclick={() => loadPage(page + 1)}>Next →</button>
</div>

<style>
  .pagination { display:flex; gap:0.75rem; justify-content:center; align-items:center; padding:2rem 0; }
</style>
