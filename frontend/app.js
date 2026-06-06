const API = '/api';

let customers = [];
let products = [];
let editingId = null;

// --- Tab Navigation ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${tab.dataset.tab}`).classList.add('active');
    if (tab.dataset.tab === 'products') loadProducts();
    if (tab.dataset.tab === 'favorites') populateCustomerSelect('favorites-customer-select');
  });
});

// --- Customers ---
document.getElementById('customer-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('customer-name').value;
  const email = document.getElementById('customer-email').value;

  try {
    if (editingId) {
      const res = await fetch(`${API}/customers/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Update failed', 'error');
        return;
      }
    } else {
      const res = await fetch(`${API}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Create failed', 'error');
        return;
      }
    }
    resetForm();
    loadCustomers();
    showToast('Customer saved', 'success');
  } catch (err) {
    showToast('Error saving customer', 'error');
  }
});

document.getElementById('customer-cancel').addEventListener('click', resetForm);

function resetForm() {
  document.getElementById('customer-form').reset();
  document.getElementById('customer-id').value = '';
  editingId = null;
  document.getElementById('customer-cancel').style.display = 'none';
}

async function loadCustomers() {
  try {
    const res = await fetch(`${API}/customers`);
    customers = await res.json();
    renderCustomers(customers);
    populateCustomerSelects();
  } catch (err) {
    console.error('Error loading customers', err);
  }
}

function renderCustomers(data) {
  const tbody = document.getElementById('customers-list');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No customers registered</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td class="actions-cell">
        <button class="btn-small" onclick="editCustomer(${c.id}, '${c.name.replace(/'/g, "\\'")}', '${c.email.replace(/'/g, "\\'")}')">Edit</button>
        <button class="btn-danger" onclick="deleteCustomer(${c.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function deleteCustomer(id) {
  if (!confirm('Delete this customer?')) return;
  try {
    await fetch(`${API}/customers/${id}`, { method: 'DELETE' });
    loadCustomers();
    showToast('Customer deleted', 'success');
  } catch (err) {
    showToast('Error deleting customer', 'error');
  }
}

function editCustomer(id, name, email) {
  editingId = id;
  document.getElementById('customer-id').value = id;
  document.getElementById('customer-name').value = name;
  document.getElementById('customer-email').value = email;
  document.getElementById('customer-cancel').style.display = 'inline-block';
}

function populateCustomerSelects() {
  const selects = ['product-customer-select', 'favorites-customer-select'];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">Select a customer</option>' +
      customers.map(c => `<option value="${c.id}" ${c.id == current ? 'selected' : ''}>${c.name}</option>`).join('');
  });
}

function populateCustomerSelect(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">Select a customer</option>' +
    customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

// --- Products ---
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '<div class="loading">Loading products...</div>';
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    products = await res.json();
    renderProducts(products);
  } catch (err) {
    grid.innerHTML = '<div class="empty-state">Failed to load products</div>';
  }
}

function renderProducts(data) {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = data.map(p => {
    const rating = p.rating
      ? `${p.rating.rate} (${p.rating.count} reviews)`
      : 'No ratings';
    return `
      <div class="product-card">
        <div class="product-img-wrap">
          <img src="${p.image}" alt="${p.title}" loading="lazy">
        </div>
        <div class="product-body">
          <h3>${p.title}</h3>
          <div class="price">$${p.price.toFixed(2)}</div>
          <div class="rating">${rating}</div>
          <button onclick="addFavorite(${p.id})">Add to Favorites</button>
        </div>
      </div>
    `;
  }).join('');
}

async function addFavorite(productId) {
  const select = document.getElementById('product-customer-select');
  const customerId = select.value;
  if (!customerId) {
    showToast('Select a customer first', 'error');
    return;
  }
  try {
    const res = await fetch(`${API}/customers/${customerId}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Failed to add favorite', 'error');
      return;
    }
    showToast('Product added to favorites!', 'success');
  } catch (err) {
    showToast('Error adding favorite', 'error');
  }
}

// --- Favorites ---
document.getElementById('favorites-customer-select').addEventListener('change', (e) => {
  if (e.target.value) loadFavorites(e.target.value);
  else document.getElementById('favorites-list').innerHTML = '<div class="empty-state">Select a customer to view their favorites</div>';
});

async function loadFavorites(customerId) {
  const container = document.getElementById('favorites-list');
  container.innerHTML = '<div class="loading">Loading favorites...</div>';
  try {
    const res = await fetch(`${API}/customers/${customerId}/favorites`);
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    renderFavorites(data, customerId);
  } catch (err) {
    container.innerHTML = '<div class="empty-state">Failed to load favorites</div>';
  }
}

function renderFavorites(data, customerId) {
  const container = document.getElementById('favorites-list');
  if (data.length === 0) {
    container.innerHTML = '<div class="empty-state">No favorites yet</div>';
    return;
  }
  container.innerHTML = data.map(f => `
    <div class="favorite-item">
      <div class="fav-img-wrap">
        <img src="${f.image}" alt="${f.title}" loading="lazy">
      </div>
      <div class="fav-info">
        <h3>${f.title}</h3>
        <div class="price">$${f.price.toFixed(2)}</div>
        ${f.rating ? `<div class="rating">${f.rating.rate} (${f.rating.count} reviews)</div>` : ''}
      </div>
      <button class="btn-danger" onclick="removeFavorite(${customerId}, ${f.id})">Remove</button>
    </div>
  `).join('');
}

async function removeFavorite(customerId, productId) {
  if (!confirm('Remove from favorites?')) return;
  try {
    await fetch(`${API}/customers/${customerId}/favorites/${productId}`, { method: 'DELETE' });
    loadFavorites(customerId);
    showToast('Favorite removed', 'success');
  } catch (err) {
    showToast('Error removing favorite', 'error');
  }
}

// --- Toast ---
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- Init ---
loadCustomers();
