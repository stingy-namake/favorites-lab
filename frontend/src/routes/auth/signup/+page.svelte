<script lang="ts">
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import { getCartStore } from '$lib/stores/cart.svelte';
  import { getFavoritesStore } from '$lib/stores/favorites.svelte';
  import { goto } from '$app/navigation';

  const auth = getAuthStore();
  const cart = getCartStore();
  const favs = getFavoritesStore();

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let error = $state('');
  let submitting = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    submitting = true;
    error = '';
    try {
      await auth.signup(email, password, name);
      cart.fetchCart();
      favs.fetchFavorites();
      goto('/');
    } catch (e: any) { error = e.message || 'Signup failed'; }
    submitting = false;
  }
</script>

<div class="auth-page">
  <div class="auth-card">
    <h1>Create account</h1>
    <p class="auth-sub">Join FakeStore today</p>
    <form onsubmit={handleSubmit}>
      <input type="text" placeholder="Full name" bind:value={name} required />
      <input type="email" placeholder="Email address" bind:value={email} required />
      <input type="password" placeholder="Password (min 6 characters)" bind:value={password} required minlength={6} />
      {#if error}<p class="auth-error">{error}</p>{/if}
      <button type="submit" class="primary" disabled={submitting} style="width:100%;padding:0.75rem;">
        {submitting ? 'Creating account...' : 'SIGN UP'}
      </button>
    </form>
    <p class="auth-footer">Already have an account? <a href="/auth/login">Log in</a></p>
  </div>
</div>

<style>
  .auth-page { display:flex; justify-content:center; padding:3rem 0; }
  .auth-card { width:100%; max-width:400px; display:flex; flex-direction:column; gap:1.25rem; }
  .auth-card h1 { font-size:1.5rem; font-weight:700; }
  .auth-sub { color:var(--text-muted); font-size:0.9rem; margin-top:-0.75rem; }
  .auth-card form { display:flex; flex-direction:column; gap:0.75rem; }
  .auth-error { color:var(--danger); font-size:0.85rem; }
  .auth-footer { text-align:center; color:var(--text-muted); font-size:0.875rem; }
  .auth-footer a { color:var(--primary); font-weight:600; }
</style>
