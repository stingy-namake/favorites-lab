<script lang="ts">
  import Carousel from '$lib/components/Carousel.svelte';
</script>

<div class="hero">
  <h1>kishin echoes</h1>
  <p>Browse our curated collection of products</p>
  <a href="/products"><button class="primary" style="margin-top:1rem;padding:0.75rem 2rem;">Shop All Products</button></a>
</div>

<Carousel title="Top Rated" />

<style>
  .hero { text-align:center; padding:3.5rem 0 1rem; }
  .hero h1 { font-size:2.25rem; font-weight:800; letter-spacing:-0.03em; }
  .hero p { color:var(--text-muted); margin-top:0.5rem; font-size:0.95rem; }
</style>
