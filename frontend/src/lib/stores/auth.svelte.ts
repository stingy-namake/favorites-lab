import type { User } from '$lib/types';
import { api } from '$lib/api';

let currentUser = $state<User | null>(null);
let loading = $state(true);

function loadFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function saveToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

async function init() {
  const token = loadFromStorage();
  if (!token) {
    loading = false;
    return;
  }
  try {
    currentUser = await api.auth.me();
  } catch {
    saveToken(null);
    currentUser = null;
  }
  loading = false;
}

async function login(email: string, password: string) {
  const res = await api.auth.login({ email, password });
  saveToken(res.token);
  currentUser = res.user;
}

async function signup(email: string, password: string, name: string) {
  const res = await api.auth.signup({ email, password, name });
  saveToken(res.token);
  currentUser = res.user;
}

function logout() {
  saveToken(null);
  currentUser = null;
}

export function getAuthStore() {
  return {
    get user() { return currentUser; },
    get loading() { return loading; },
    get isAuthenticated() { return currentUser !== null; },
    get isAdmin() { return currentUser?.role === 'admin'; },
    init,
    login,
    signup,
    logout,
  };
}
