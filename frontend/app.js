const API = '/api';

// --- State ---
let allProducts = [];
let categories = [];
let currentCategory = 'all';
let currentPage = 1;
const PER_PAGE = 8;
let token = localStorage.getItem('token') || null;
let user = null;
let cartItems = [];
let favoritedIds = new Set();

// --- DOM refs ---
const $ = id => document.getElementById(id);
let previousTab = 'home';
const sections = {
  home: $('section-home'),
  favorites: $('section-favorites'),
  product: $('section-product'),
};

// --- Init ---
restoreSession();
loadTheme();
loadCategories();
loadProducts();
setupTabs();
setupAuthModal();
setupCart();
setupTheme();

// --- Session ---
function restoreSession() {
  token = localStorage.getItem('token');
  if (token) fetchUser();
}

function saveSession(t, u) {
  token = t; user = u;
  localStorage.setItem('token', t);
  renderAuth();
  loadCart();
  loadFavoritedIds();
}

function clearSession() {
  token = null; user = null;
  localStorage.removeItem('token');
  renderAuth();
  cartItems = [];
  favoritedIds = new Set();
  renderCartBadge();
  renderProducts();
  if ($('section-favorites').classList.contains('active')) switchTab('home');
}

async function fetchUser() {
  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('expired');
    user = await res.json();
    renderAuth();
    loadCart();
    loadFavoritedIds();
  } catch { clearSession(); }
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
      if (tab === 'favorites' && !user) { openAuthModal(); return; }
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

// --- Products ---
async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    allProducts = await res.json();
    renderProducts();
  } catch { $('products-grid').innerHTML = '<div class="empty-state">Failed to load products</div>'; }
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
    categories.map(c => `<button class="chip" data-cat="${c}">${c}</button>`).join('');
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
    const inCart = cartItems.some(i => i.product_id === p.id);
    const isFav = favoritedIds.has(p.id);
    const heartFill = isFav ? 'currentColor' : 'none';
    return `
      <div class="product-card">
        <div class="product-img-wrap" data-id="${p.id}" style="cursor:pointer">
          <img src="${p.image}" alt="${p.title}" loading="lazy">
          <button class="fav-btn ${isFav ? 'fav-active' : ''}" data-id="${p.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${heartFill}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
        <div class="product-body">
          <h3 style="cursor:pointer" data-id="${p.id}">${p.title}</h3>
          <div class="rating-row">${stars} <span class="review-count">${reviewCount}</span></div>
          <div class="price">$${p.price.toFixed(2)}</div>
          <button class="add-cart-btn ${inCart ? 'in-cart' : ''}" data-id="${p.id}">${inCart ? 'In Cart' : 'Add to Cart'}</button>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!user) { openAuthModal(); return; }
      const pid = Number(btn.dataset.id);
      const wasFav = favoritedIds.has(pid);
      // optimistic toggle
      if (wasFav) {
        favoritedIds.delete(pid);
        btn.classList.remove('fav-active');
        btn.querySelector('svg').setAttribute('fill', 'none');
        btn.title = 'Add to favorites';
      } else {
        favoritedIds.add(pid);
        btn.classList.add('fav-active');
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
        btn.title = 'Remove from favorites';
      }
      try {
        if (wasFav) {
          await fetch(`${API}/favorites/${pid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          showToast('Removed from favorites', 'success');
        } else {
          const res = await fetch(`${API}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ product_id: pid }),
          });
          if (!res.ok) throw new Error((await res.json()).error);
          showToast('Added to favorites!', 'success');
        }
      } catch {
        // revert
        if (wasFav) {
          favoritedIds.add(pid);
          btn.classList.add('fav-active');
          btn.querySelector('svg').setAttribute('fill', 'currentColor');
        } else {
          favoritedIds.delete(pid);
          btn.classList.remove('fav-active');
          btn.querySelector('svg').setAttribute('fill', 'none');
        }
        showToast('Error toggling favorite', 'error');
      }
    });
  });

  grid.querySelectorAll('.product-img-wrap[data-id], .product-body h3[data-id]').forEach(el => {
    el.addEventListener('click', () => showProductDetail(Number(el.dataset.id)));
  });

  grid.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!user) { openAuthModal(); return; }
      const pid = Number(btn.dataset.id);
      const alreadyInCart = cartItems.some(i => i.product_id === pid);
      if (alreadyInCart) { openCart(); return; }
      try {
        const res = await fetch(`${API}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: pid, quantity: 1 }),
        });
        if (!res.ok) { const err = await res.json(); showToast(err.error || 'Failed', 'error'); return; }
        showToast('Added to cart!', 'success');
        await loadCart();
        // update this button
        btn.textContent = 'In Cart';
        btn.classList.add('in-cart');
      } catch { showToast('Error adding to cart', 'error'); }
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

// --- Product Detail ---
function showProductDetail(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) { showToast('Product not found', 'error'); return; }
  // save current tab
  const activeTab = document.querySelector('.nav-link.active');
  previousTab = activeTab ? activeTab.dataset.tab : 'home';
  // switch to product section
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  Object.values(sections).forEach(s => s.classList.remove('active'));
  sections.product.classList.add('active');
  renderProductDetail(product);
  window.scrollTo({ top: 0 });
}

function renderProductDetail(product) {
  const container = $('product-detail');
  const inCart = cartItems.some(i => i.product_id === product.id);
  const isFav = favoritedIds.has(product.id);
  const r = product.rating;
  const stars = r ? renderStars(r.rate) : '';

  container.innerHTML = `
    <div class="product-detail">
      <div class="product-detail-img">
        <img src="${product.image}" alt="${product.title}">
      </div>
      <div class="product-detail-info">
        <span class="product-detail-category">${product.category}</span>
        <h2>${product.title}</h2>
        <div class="rating-row">${stars} ${r ? `<span class="review-count">${r.count} reviews</span>` : ''}</div>
        <div class="product-detail-price">$${product.price.toFixed(2)}</div>
        <p class="product-detail-desc">${product.description}</p>
        <div class="product-detail-actions">
          <button class="add-cart-btn ${inCart ? 'in-cart' : ''}" data-id="${product.id}">${inCart ? 'In Cart' : 'Add to Cart'}</button>
          <button class="btn-outline ${isFav ? 'fav-active' : ''}" id="detail-fav-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            ${isFav ? 'Favorited' : 'Favorite'}
          </button>
        </div>
      </div>
    </div>
  `;

  // detail cart button
  container.querySelector('.add-cart-btn').addEventListener('click', async () => {
    if (!user) { openAuthModal(); return; }
    const already = cartItems.some(i => i.product_id === product.id);
    if (already) { openCart(); return; }
    try {
      const res = await fetch(`${API}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
      if (!res.ok) { const e = await res.json(); showToast(e.error || 'Failed', 'error'); return; }
      showToast('Added to cart!', 'success');
      await loadCart();
      renderProductDetail(product);
    } catch { showToast('Error adding to cart', 'error'); }
  });

  // detail fav button
  container.querySelector('#detail-fav-btn').addEventListener('click', async () => {
    if (!user) { openAuthModal(); return; }
    const wasFav = favoritedIds.has(product.id);
    if (wasFav) {
      favoritedIds.delete(product.id);
      try {
        await fetch(`${API}/favorites/${product.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        showToast('Removed from favorites', 'success');
      } catch { favoritedIds.add(product.id); showToast('Error', 'error'); }
    } else {
      favoritedIds.add(product.id);
      try {
        const res = await fetch(`${API}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: product.id }),
        });
        if (!res.ok) throw new Error();
        showToast('Added to favorites!', 'success');
      } catch { favoritedIds.delete(product.id); showToast('Error', 'error'); }
    }
    renderProductDetail(product);
    renderProducts();
  });
}

// --- Back ---
$('product-back').addEventListener('click', () => {
  switchTab(previousTab);
});

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
  } catch { container.innerHTML = '<div class="empty-state">Failed to load favorites.</div>'; }
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
      <div class="fav-item" style="cursor:pointer" data-id="${f.id}">
        <div class="fav-img-wrap"><img src="${f.image}" alt="${f.title}" loading="lazy"></div>
        <div class="fav-info">
          <h3>${f.title}</h3>
          <div class="rating-row">${stars}</div>
          <div class="price">$${f.price.toFixed(2)}</div>
        </div>
        <button class="btn-remove" data-id="${f.id}" onclick="event.stopPropagation()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>
      </div>
    `;
  }).join('');
  container.querySelectorAll('.fav-item').forEach(item => {
    item.addEventListener('click', () => showProductDetail(Number(item.dataset.id)));
  });
  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pid = Number(btn.dataset.id);
      try {
        await fetch(`${API}/favorites/${pid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        loadFavorites();
        showToast('Favorite removed', 'success');
      } catch { showToast('Error removing favorite', 'error'); }
    });
  });
}

// --- Cart ---
function setupCart() {
  $('cart-btn').addEventListener('click', openCart);
  $('cart-close').addEventListener('click', closeCart);
  $('cart-overlay').addEventListener('click', closeCart);
  $('cart-clear').addEventListener('click', clearCart);
}

async function loadCart() {
  if (!user) { cartItems = []; renderCartBadge(); renderProducts(); return; }
  try {
    const res = await fetch(`${API}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('fail');
    cartItems = await res.json();
    renderCartBadge();
    renderProducts();
    if (!$('cart-drawer').classList.contains('hidden')) renderCartDrawer();
  } catch { cartItems = []; renderCartBadge(); renderProducts(); }
}

async function loadFavoritedIds() {
  if (!user) { favoritedIds = new Set(); return; }
  try {
    const res = await fetch(`${API}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    favoritedIds = new Set(data.map(f => f.id));
    renderProducts();
  } catch { favoritedIds = new Set(); }
}

function renderCartBadge() {
  const badge = $('cart-count');
  const count = cartItems.reduce((s, i) => s + i.quantity, 0);
  if (count > 0) { badge.textContent = count; badge.classList.remove('hidden'); }
  else badge.classList.add('hidden');
}

function openCart() { 
  $('cart-overlay').classList.remove('hidden');
  $('cart-drawer').classList.remove('hidden');
  renderCartDrawer();
  setTimeout(() => {
    $('cart-overlay').classList.add('open');
    $('cart-drawer').classList.add('open');
  }, 10);
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('cart-overlay').classList.remove('open');
  $('cart-drawer').classList.remove('open');
  setTimeout(() => {
    $('cart-overlay').classList.add('hidden');
    $('cart-drawer').classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
}

function renderCartDrawer() {
  const body = $('cart-body');
  if (cartItems.length === 0) {
    body.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
    $('cart-total').textContent = '$0.00';
    return;
  }
  body.innerHTML = cartItems.map(item => `
    <div class="cart-item" style="cursor:pointer" data-pid="${item.product_id}">
      <div class="cart-item-img"><img src="${item.image}" alt="${item.title}" loading="lazy"></div>
      <div class="cart-item-info">
        <h4>${item.title}</h4>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        <div class="cart-qty" onclick="event.stopPropagation()">
          <button class="qty-btn" data-pid="${item.product_id}" data-dir="-1">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-pid="${item.product_id}" data-dir="1">+</button>
          <button class="cart-item-remove" data-pid="${item.product_id}" title="Remove">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  body.querySelectorAll('.cart-item').forEach(item => {
    item.addEventListener('click', () => { closeCart(); showProductDetail(Number(item.dataset.pid)); });
  });

  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  $('cart-total').textContent = `$${total.toFixed(2)}`;

  body.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pid = Number(btn.dataset.pid);
      const dir = Number(btn.dataset.dir);
      const item = cartItems.find(i => i.product_id === pid);
      if (!item) return;
      const newQty = item.quantity + dir;
      if (newQty < 1) { removeCartItem(pid); return; }
      try {
        await fetch(`${API}/cart/${pid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quantity: newQty }),
        });
        loadCart();
      } catch { showToast('Error updating quantity', 'error'); }
    });
  });

  body.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeCartItem(Number(btn.dataset.pid)));
  });
}

async function removeCartItem(productId) {
  try {
    await fetch(`${API}/cart/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    showToast('Item removed from cart', 'success');
    loadCart();
  } catch { showToast('Error removing item', 'error'); }
}

async function clearCart() {
  if (!confirm('Clear your entire cart?')) return;
  try {
    await fetch(`${API}/cart`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    showToast('Cart cleared', 'success');
    loadCart();
    closeCart();
  } catch { showToast('Error clearing cart', 'error'); }
}

// --- Auth Modal ---
function setupAuthModal() {
  const modal = $('auth-modal');
  const close = modal.querySelector('.modal-close');
  $('login-btn').addEventListener('click', openAuthModal);
  close.addEventListener('click', closeAuthModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeAuthModal(); });

  modal.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const form = tab.dataset.form;
      $('login-form').style.display = form === 'login' ? 'block' : 'none';
      $('register-form').style.display = form === 'register' ? 'block' : 'none';
    });
  });

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
      showToast('Signed in!', 'success');
    } catch { errEl.textContent = 'Connection error'; }
  });

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

  $('logout-btn').addEventListener('click', () => {
    clearSession();
    closeCart();
    showToast('Signed out', 'info');
  });
}

function openAuthModal() {
  $('login-form').reset();
  $('register-form').reset();
  $('login-error').textContent = '';
  $('register-error').textContent = '';
  $('auth-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  // switch to login tab
  $('auth-modal').querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  $('auth-modal').querySelector('[data-form="login"]').classList.add('active');
  $('login-form').style.display = 'block';
  $('register-form').style.display = 'none';
}

function closeAuthModal() {
  $('auth-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// --- Theme ---
function setupTheme() {
  $('theme-btn').addEventListener('click', toggleTheme);
}

function loadTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark');
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
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

// --- Init ---
loadProducts();
