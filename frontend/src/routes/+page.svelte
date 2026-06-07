<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import type { Product } from '$lib/types';

  let products = $state<Product[]>([]);
  let categories = $state<string[]>([]);
  let selectedCategory = $state('');
  let loading = $state(true);
  let search = $state('');

  onMount(async () => {
    try {
      const [res, cats] = await Promise.all([
        api.products.list({ limit: 8 }),
        api.products.categories(),
      ]);
      products = res.items;
      categories = cats;
    } catch { /* ignore */ }
    loading = false;
  });

  async function filterByCategory(cat: string) {
    selectedCategory = cat;
    loading = true;
    try {
      const res = await api.products.list({ limit: 8, category: cat || undefined });
      products = res.items;
    } catch { /* ignore */ }
    loading = false;
  }

  function handleSearch(e: Event) {
    const q = (e.target as HTMLInputElement).value;
    search = q;
    loading = true;
    api.products.list({ limit: 8, q: q || undefined }).then(res => products = res.items).catch(() => {}).finally(() => loading = false);
  }
</script>

<div class="hero">
  <h1>FakeStore</h1>
  <p>Browse our curated collection of products</p>
</div>

<div class="filter-bar">
  <input placeholder="Search products..." value={search} oninput={handleSearch} style="max-width:280px;" />
  <button class={selectedCategory === '' ? 'primary' : 'secondary'} onclick={() => filterByCategory('')}>All</button>
  {#each categories as cat}
    <button class={selectedCategory === cat ? 'primary' : 'secondary'} onclick={() => filterByCategory(cat)}>{cat}</button>
  {/each}
</div>

{#if loading}
  <p class="empty-state">Loading...</p>
{:else}
  <div class="product-grid">
    {#each products as product}
      <ProductCard {product} />
    {/each}
  </div>
  {#if products.length === 0}
    <p class="empty-state">No products found.</p>
  {/if}
  <div style="text-align:center;padding:2rem 0;">
    <a href="/products"><button class="primary" style="padding:0.75rem 2rem;">View All Products →</button></a>
  </div>
{/if}

<style>
  .hero { text-align:center; padding:3.5rem 0 2rem; }
  .hero h1 { font-size:2.25rem; font-weight:800; letter-spacing:-0.03em; }
  .hero p { color:var(--text-muted); margin-top:0.5rem; font-size:0.95rem; }
</style>
