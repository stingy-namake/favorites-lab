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
  let userMenuOpen = $state(false);

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
    theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    const saved = localStorage.getItem('accent') || 'orange';
    applyAccent(saved);
    auth.init().then(() => {
      if (auth.isAuthenticated) { cart.fetchCart(); favs.fetchFavorites(); }
    });
    document.addEventListener('click', (e) => {
      if (accentOpen && !(e.target as HTMLElement)?.closest('.accent-wrap')) accentOpen = false;
      if (userMenuOpen && !(e.target as HTMLElement)?.closest('.user-wrap')) userMenuOpen = false;
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
    {#if auth.isAdmin}<a href="/admin">ADMIN</a>{/if}
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
    <button class="nav-icon-link" onclick={() => cartOpen = !cartOpen} aria-label="Cart">
      <span class="nav-icon-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>
        {#if cart.count > 0}<span class="nav-icon-badge">{cart.count}</span>{/if}
      </span>
    </button>
    <a href="/favorites" class="nav-icon-link" aria-label="Favorites">
      <span class="nav-icon-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        {#if favs.count > 0}<span class="nav-icon-badge">{favs.count}</span>{/if}
      </span>
    </a>
    <div class="user-wrap">
      <button class="nav-icon-link" onclick={() => userMenuOpen = !userMenuOpen} aria-label="User menu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </button>
      {#if userMenuOpen}
        <div class="user-dropdown">
          {#if auth.isAuthenticated}
            <span class="user-dropdown-name">{auth.user?.name}</span>
            <button class="user-dropdown-btn" onclick={handleLogout}>LOGOUT</button>
          {:else}
            <a href="/auth/login" class="user-dropdown-link">LOGIN</a>
            <a href="/auth/signup" class="user-dropdown-link">SIGN UP</a>
          {/if}
        </div>
      {/if}
    </div>
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
    <span class="footer-sep">|</span>
    <span class="footer-team">Team: Me, Myself and I</span>
    <a href="https://github.com/stingy-namake/favorites-lab" class="footer-github" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
    </a>
  </div>
</footer>

<style>
  .nav-logo { height:24px; width:auto; display:block; }
  .nav-icon-link { display:flex; align-items:center; justify-content:center; width:30px; height:30px; color:var(--text-nav); text-decoration:none; background:none; border:none; font:inherit; cursor:pointer; padding:0; border-radius:6px; }
  .nav-icon-link:hover { color:var(--nav-hover, var(--primary)); background:rgba(255,255,255,0.08); }
  .nav-icon-wrap { position:relative; display:flex; }
  .nav-icon-badge { position:absolute; top:-5px; right:-12px; background:var(--primary); color:var(--primary-text, white); font-size:0.5rem; font-weight:700; border-radius:8px; min-width:14px; height:14px; padding:0 3px; display:flex; align-items:center; justify-content:center; line-height:1; }

  .user-wrap { position:relative; display:flex; }
  .user-dropdown { position:absolute; top:100%; right:0; margin-top:6px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); min-width:140px; z-index:200; padding:0.375rem; animation:dropIn 0.12s ease-out; }
  .user-dropdown-name { display:block; padding:0.375rem 0.5rem; font-size:0.8rem; color:var(--text); font-weight:500; white-space:nowrap; }
  .user-dropdown-btn { width:100%; font-size:0.75rem; font-weight:600; padding:0.375rem 0.5rem; text-align:left; background:none; border:none; border-radius:var(--radius); cursor:pointer; color:var(--text-muted); }
  .user-dropdown-btn:hover { background:var(--bg-alt); color:var(--danger); }
  .user-dropdown-link { display:block; font-size:0.75rem; font-weight:600; padding:0.375rem 0.5rem; border-radius:var(--radius); color:var(--text-muted); text-decoration:none; }
  .user-dropdown-link:hover { background:var(--bg-alt); color:var(--text); }

  main { flex:1; }
  .footer { background:var(--nav-bg); padding:1.5rem 0; text-align:center; }
  .footer .container { display:flex; align-items:center; justify-content:center; gap:0.5rem; }
  .footer span { color:var(--text-muted); font-size:0.8rem; font-weight:400; }
  .footer-sep { opacity:0.3; }
  .footer-team { font-style:italic; }
  .footer-github { color:var(--text-muted); display:flex; transition:color 0.15s; }
  .footer-github:hover { color:var(--primary); }
</style>
