<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import type { User } from '$lib/types';
  import { goto } from '$app/navigation';

  const auth = getAuthStore();
  let users = $state<User[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(() => {
    if (!auth.isAuthenticated) goto('/auth/login');
    else if (!auth.isAdmin) goto('/');
    else loadUsers();
  });

  async function loadUsers() {
    loading = true;
    try { users = await api.admin.users(); }
    catch (e: any) { error = e.message || 'Failed to load users'; }
    loading = false;
  }

  async function deleteUser(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await api.admin.deleteUser(id); users = users.filter(u => u.id !== id); }
    catch (e: any) { alert(e.message); }
  }
</script>

<div class="page-header"><h1>Admin Dashboard</h1><span style="color:var(--text-muted);font-size:0.9rem;">Manage users</span></div>

{#if loading}
  <p class="empty-state">Loading users...</p>
{:else if error}
  <p style="color:var(--danger);padding:1rem 0;">{error}</p>
{:else}
  <div style="overflow-x:auto;padding:1rem 0;">
    <table class="admin-table">
      <thead>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {#each users as user}
          <tr>
            <td>{user.id}</td>
            <td style="font-weight:500;">{user.name}</td>
            <td style="color:var(--text-muted);">{user.email}</td>
            <td><span class="tag" class:active={user.role === 'admin'}>{user.role}</span></td>
            <td>
              {#if user.role !== 'admin'}
                <button class="danger" style="font-size:0.8rem;" onclick={() => deleteUser(user.id, user.name)}>DELETE</button>
              {:else}
                <span style="color:var(--text-muted);font-size:0.85rem;">—</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .admin-table { width:100%; border-collapse:collapse; font-size:0.875rem; }
  .admin-table th { padding:0.75rem; text-align:left; font-weight:600; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); border-bottom:1px solid var(--border); background:var(--bg-alt); }
  .admin-table td { padding:0.75rem; border-bottom:1px solid var(--border); }
  .admin-table tbody tr:hover { background:var(--bg-alt); }
</style>
