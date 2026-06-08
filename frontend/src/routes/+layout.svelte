<script lang="ts">
  import './../app.css';
  import { onMount } from 'svelte';
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { getFavoritesStore } from '$lib/stores/favorites.svelte';
  import CartPanel from '$lib/components/CartPanel.svelte';
  import Snackbar from '$lib/components/Snackbar.svelte';
  import ProductOverlay from '$lib/components/ProductOverlay.svelte';

  let { children } = $props();

  const auth = getAuthStore();
  const cart = getCartStore();
  const favs = getFavoritesStore();

  let theme = $state('dark');
  let accentOpen = $state(false);
  let cartOpen = $state(false);

  const ACCENTS = [
    { id: 'orange', label: 'Orange', primary: '#f97316', hover: '#ea580c', light: '#fff7ed', lightDark: '#1c0a04' },
    { id: 'blue', label: 'Blue', primary: '#3b82f6', hover: '#2563eb', light: '#eff6ff', lightDark: '#0c1629' },
    { id: 'green', label: 'Green', primary: '#10b981', hover: '#059669', light: '#ecfdf5', lightDark: '#04180f' },
    { id: 'purple', label: 'Purple', primary: '#8b5cf6', hover: '#7c3aed', light: '#f5f3ff', lightDark: '#150b2e' },
    { id: 'red', label: 'Red', primary: '#ef4444', hover: '#dc2626', light: '#fef2f2', lightDark: '#2c0a0a' },
    { id: 'teal', label: 'Teal', primary: '#06b6d4', hover: '#0891b2', light: '#ecfeff', lightDark: '#04181c' },
    { id: 'mono', label: 'Mono', primary: '', hover: '', light: '', lightDark: '' },
  ];

  let activeAccent = $state('orange');

  function applyAccent(id: string) {
    activeAccent = id;
    localStorage.setItem('accent', id);
    const a = ACCENTS.find(x => x.id === id);
    if (!a) return;
    if (id === 'mono') {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.documentElement.style.setProperty('--primary', isDark ? '#ffffff' : '#111111');
      document.documentElement.style.setProperty('--primary-hover', isDark ? '#cccccc' : '#333333');
      document.documentElement.style.setProperty('--primary-light', isDark ? '#1a1a1a' : '#f5f5f5');
      document.documentElement.style.setProperty('--nav-hover', '#ffffff');
      document.documentElement.style.setProperty('--primary-text', isDark ? '#111111' : '#ffffff');
    } else {
      document.documentElement.style.setProperty('--primary', a.primary);
      document.documentElement.style.setProperty('--primary-hover', a.hover);
      document.documentElement.style.setProperty('--primary-light', theme === 'dark' ? a.lightDark : a.light);
      document.documentElement.style.setProperty('--nav-hover', a.primary);
      document.documentElement.style.setProperty('--primary-text', '#ffffff');
    }
    accentOpen = false;
  }

  onMount(() => {
    theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    const saved = localStorage.getItem('accent') || 'orange';
    applyAccent(saved);
    auth.init().then(() => {
      if (auth.isAuthenticated) { cart.fetchCart(); favs.fetchFavorites(); }
    });
    document.addEventListener('click', (e) => {
      if (accentOpen && !(e.target as HTMLElement)?.closest('.accent-wrap')) accentOpen = false;
    });
  });

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (activeAccent === 'mono') applyAccent('mono');
    else applyAccent(activeAccent);
  }

  function handleLogout() { auth.logout(); cart.fetchCart(); favs.fetchFavorites(); }
</script>

<nav class="nav">
  <a href="/" class="nav-brand">
    <img src="/kishin-logo-white.png" alt="Kishin Echoes" class="nav-logo" />
  </a>
  <div class="nav-links">
    <a href="/products">PRODUCTS</a>
    {#if auth.isAuthenticated}
      <button class="nav-link-btn" onclick={() => cartOpen = !cartOpen}>CART{#if cart.count > 0}<span class="nav-badge">{cart.count}</span>{/if}</button>
      <a href="/favorites">FAVORITES{#if favs.count > 0}<span class="nav-badge">{favs.count}</span>{/if}</a>
      {#if auth.isAdmin}<a href="/admin">ADMIN</a>{/if}
    {/if}
  </div>
  <div class="nav-right">
    <div class="accent-wrap">
      <button class="accent-trigger" onclick={() => accentOpen = !accentOpen} title="Accent color"></button>
      {#if accentOpen}
        <div class="accent-dropdown">
          {#each ACCENTS as a}
            <button
              class="accent-swatch"
              class:active={activeAccent === a.id}
              style="background:{a.id === 'mono' ? 'var(--text)' : a.primary}"
              title={a.label}
              onclick={() => applyAccent(a.id)}
            ></button>
          {/each}
        </div>
      {/if}
    </div>
    <button class="nav-theme" onclick={toggleTheme}>
      {#if theme === 'dark'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      {:else}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      {/if}
    </button>
    {#if auth.isAuthenticated}
      <span class="nav-user">{auth.user?.name}</span>
      <button class="nav-btn" onclick={handleLogout}>LOGOUT</button>
    {:else}
      <a href="/auth/login"><button class="nav-btn">LOGIN</button></a>
      <a href="/auth/signup"><button class="nav-btn nav-btn-primary">SIGN UP</button></a>
    {/if}
  </div>
</nav>

<CartPanel open={cartOpen} onclose={() => cartOpen = false} />
<Snackbar />
<ProductOverlay />

<main class="container" style="padding-top:2rem;padding-bottom:4rem;">
  {@render children()}
</main>

<footer class="footer">
  <div class="container">
    <span>Kishin Echoes &middot; powered by FakeStoreAPI</span>
    <a href="https://github.com/stingy-namake/favorites-lab" class="footer-github" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
    </a>
  </div>
</footer>

<style>
  .nav-logo { height:24px; width:auto; display:block; }
  .nav-link-btn { background:transparent; color:var(--text-nav); border:none; font:inherit; font-size:0.825rem; font-weight:500; letter-spacing:0.02em; padding:0; cursor:pointer; }
  .nav-link-btn:hover { color:var(--nav-hover, var(--primary)); }
  main { flex:1; }
  .footer { background:var(--nav-bg); padding:1.5rem 0; text-align:center; }
  .footer .container { display:flex; align-items:center; justify-content:center; gap:0.5rem; }
  .footer span { color:var(--text-muted); font-size:0.8rem; font-weight:400; }
  .footer-github { color:var(--text-muted); display:flex; transition:color 0.15s; }
  .footer-github:hover { color:var(--primary); }
</style>
