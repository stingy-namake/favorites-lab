const API = '/api';

// --- State ---
let allProducts = [];
let categories = [];
let currentCategory = 'all';
let currentPage = 1;
const PER_PAGE = 8;
let token = localStorage.getItem('token') || null;
let user = null;

// --- DOM refs ---
const $ = id => document.getElementById(id);
const sections = {
  home: $('section-home'),
  favorites: $('section-favorites'),
};

// --- Init ---
restoreSession();
loadCategories();
loadProducts();
setupTabs();
setupAuthModal();

// --- Session ---
function restoreSession() {
  token = localStorage.getItem('token');
  if (token) fetchUser();
}

function saveSession(t, u) {
  token = t;
  user = u;
  localStorage.setItem('token', t);
  renderAuth();
}

function clearSession() {
  token = null;
  user = null;
  localStorage.removeItem('token');
  renderAuth();
  // if on favorites tab, switch to home
  if ($('section-favorites').classList.contains('active')) {
    switchTab('home');
  }
}

async function fetchUser() {
  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('expired');
    user = await res.json();
    renderAuth();
  } catch {
    clearSession();
  }
}

function renderAuth() {
  const loginBtn = $('login-btn');
  const userMenu = $('user-menu');
  const userName = $('user-name');
  if (user) {
    loginBtn.style.display = 'none';
    userMenu.style.display = 'flex';
    userName.textContent = user.name;
  } else {
    loginBtn.style.display = 'inline-block';
    userMenu.style.display = 'none';
  }
}

// --- Tab navigation ---
function setupTabs() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const tab = link.dataset.tab;
      if (tab === 'favorites' && !user) {
        openAuthModal();
        return;
      }
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-tab="${tab}"]`)?.classList.add('active');
  Object.values(sections).forEach(s => s.classList.remove('active'));
  $(`section-${tab}`).classList.add('active');
  if (tab === 'favorites') loadFavorites();
}

// --- Products (client-side pagination + category filter) ---
async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    allProducts = await res.json();
    renderProducts();
  } catch {
    $('products-grid').innerHTML = '<div class="empty-state">Failed to load products</div>';
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API}/products/categories`);
    categories = await res.json();
    renderCategories();
  } catch { /* ignore */ }
}

function renderCategories() {
  const container = $('category-filters');
  container.innerHTML = '<button class="chip active" data-cat="all">All</button>' +
    categories.map(c =>
      `<button class="chip" data-cat="${c}">${c}</button>`
    ).join('');
  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.dataset.cat;
      currentPage = 1;
      renderProducts();
    });
  });
}

function renderProducts() {
  const grid = $('products-grid');
  const filtered = currentCategory === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === currentCategory);

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  $('result-count').textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state">No products found in this category.</div>';
    renderPagination(totalPages);
    return;
  }

  grid.innerHTML = pageItems.map(p => {
    const r = p.rating;
    const stars = r ? renderStars(r.rate) : '';
    const reviewCount = r ? `(${r.count})` : '';
    return `
      <div class="product-card">
        <div class="product-img-wrap">
          <img src="${p.image}" alt="${p.title}" loading="lazy">
          <button class="fav-btn ${user ? '' : 'fav-guest'}" data-id="${p.id}" title="Add to favorites">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
        <div class="product-body">
          <h3>${p.title}</h3>
          <div class="rating-row">${stars} <span class="review-count">${reviewCount}</span></div>
          <div class="price">$${p.price.toFixed(2)}</div>
        </div>
      </div>
    `;
  }).join('');

  // Attach fav button listeners
  grid.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!user) { openAuthModal(); return; }
      const pid = Number(btn.dataset.id);
      try {
        const res = await fetch(`${API}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: pid }),
        });
        if (!res.ok) {
          const err = await res.json();
          showToast(err.error || 'Failed', 'error');
          return;
        }
        showToast('Added to favorites!', 'success');
      } catch {
        showToast('Error adding favorite', 'error');
      }
    });
  });

  renderPagination(totalPages);
}

function renderStars(rate) {
  const full = Math.floor(rate);
  const half = rate - full >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) html += '<span class="star full">★</span>';
    else if (i === full && half) html += '<span class="star half">★</span>';
    else html += '<span class="star empty">★</span>';
  }
  return html + ` <span class="rate-num">${rate.toFixed(1)}</span>`;
}

function renderPagination(total) {
  const el = $('pagination');
  if (total <= 1) { el.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= total; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  el.innerHTML = html;
  el.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.dataset.page);
      renderProducts();
      el.querySelector('.active')?.classList.remove('active');
      btn.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// --- Favorites ---
async function loadFavorites() {
  const container = $('favorites-list');
  if (!user) { container.innerHTML = '<div class="empty-state">Sign in to see your favorites.</div>'; return; }
  container.innerHTML = '<div class="loading">Loading favorites...</div>';
  try {
    const res = await fetch(`${API}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    renderFavorites(data);
  } catch {
    container.innerHTML = '<div class="empty-state">Failed to load favorites.</div>';
  }
}

function renderFavorites(data) {
  const container = $('favorites-list');
  if (data.length === 0) {
    container.innerHTML = '<div class="empty-state">No favorites yet. Browse products and save some!</div>';
    return;
  }
  container.innerHTML = data.map(f => {
    const r = f.rating;
    const stars = r ? renderStars(r.rate) : '';
    return `
      <div class="fav-item">
        <div class="fav-img-wrap">
          <img src="${f.image}" alt="${f.title}" loading="lazy">
        </div>
        <div class="fav-info">
          <h3>${f.title}</h3>
          <div class="rating-row">${stars}</div>
          <div class="price">$${f.price.toFixed(2)}</div>
        </div>
        <button class="btn-remove" data-id="${f.id}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>
      </div>
    `;
  }).join('');
  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pid = Number(btn.dataset.id);
      try {
        await fetch(`${API}/favorites/${pid}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        loadFavorites();
        showToast('Favorite removed', 'success');
      } catch {
        showToast('Error removing favorite', 'error');
      }
    });
  });
}

// --- Auth Modal ---
function setupAuthModal() {
  const modal = $('auth-modal');
  const close = modal.querySelector('.modal-close');

  $('login-btn').addEventListener('click', openAuthModal);
  close.addEventListener('click', closeAuthModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeAuthModal(); });

  // Tab switching
  modal.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const form = tab.dataset.form;
      $('login-form').style.display = form === 'login' ? 'block' : 'none';
      $('register-form').style.display = form === 'register' ? 'block' : 'none';
    });
  });

  // Login
  $('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get('email');
    const password = fd.get('password');
    const errEl = $('login-error');
    errEl.textContent = '';
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { const d = await res.json(); errEl.textContent = d.error || 'Login failed'; return; }
      const d = await res.json();
      saveSession(d.token, d.user);
      closeAuthModal();
      showToast('Signed in successfully!', 'success');
    } catch { errEl.textContent = 'Connection error'; }
  });

  // Register
  $('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name');
    const email = fd.get('email');
    const password = fd.get('password');
    const errEl = $('register-error');
    errEl.textContent = '';
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) { const d = await res.json(); errEl.textContent = d.error || 'Registration failed'; return; }
      const d = await res.json();
      saveSession(d.token, d.user);
      closeAuthModal();
      showToast('Account created!', 'success');
    } catch { errEl.textContent = 'Connection error'; }
  });

  // Logout
  $('logout-btn').addEventListener('click', () => {
    clearSession();
    showToast('Signed out', 'info');
  });
}

function openAuthModal() {
  // Reset
  $('login-form').reset();
  $('register-form').reset();
  $('login-error').textContent = '';
  $('register-error').textContent = '';
  $('auth-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  $('auth-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// --- Toast ---
function showToast(msg, type = 'info') {
  const container = $('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}
