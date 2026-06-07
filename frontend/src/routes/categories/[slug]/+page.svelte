<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import type { Product } from '$lib/types';

  let { params } = $props();
  let products = $state<Product[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const res = await api.products.list({ category: params.slug, limit: 50 });
      products = res.items;
    } catch { /* ignore */ }
    loading = false;
  });
</script>

<div class="page-header">
  <h1 style="text-transform:capitalize;">{params.slug.replace('-', ' ')}</h1>
</div>

{#if loading}
  <p class="empty-state">Loading...</p>
{:else if products.length === 0}
  <p class="empty-state">No products in this category.</p>
{:else}
  <div class="product-grid">
    {#each products as product}
      <ProductCard {product} />
    {/each}
  </div>
{/if}
