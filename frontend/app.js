const API = '/api';

let clientes = [];
let produtos = [];
let editingId = null;

// --- Tab Navigation ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${tab.dataset.tab}`).classList.add('active');
    if (tab.dataset.tab === 'produtos') loadProdutos();
    if (tab.dataset.tab === 'favoritos') loadClientesSelect('favoritos-cliente-select');
  });
});

// --- Clientes ---
document.getElementById('cliente-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('cliente-nome').value;
  const email = document.getElementById('cliente-email').value;

  try {
    if (editingId) {
      await fetch(`${API}/clientes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email }),
      });
    } else {
      await fetch(`${API}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email }),
      });
    }
    resetForm();
    loadClientes();
  } catch (err) {
    alert('Erro ao salvar cliente');
  }
});

document.getElementById('cliente-cancel').addEventListener('click', resetForm);

function resetForm() {
  document.getElementById('cliente-form').reset();
  document.getElementById('cliente-id').value = '';
  editingId = null;
  document.getElementById('cliente-cancel').style.display = 'none';
}

async function loadClientes() {
  try {
    const res = await fetch(`${API}/clientes`);
    clientes = await res.json();
    renderClientes(clientes);
    populateClienteSelects();
  } catch (err) {
    console.error('Erro ao carregar clientes', err);
  }
}

function renderClientes(data) {
  const tbody = document.getElementById('clientes-list');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum cliente cadastrado</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.nome}</td>
      <td>${c.email}</td>
      <td>
        <button class="btn-small" onclick="editCliente(${c.id}, '${c.nome.replace(/'/g, "\\'")}', '${c.email.replace(/'/g, "\\'")}')">Editar</button>
        <button class="btn-danger" onclick="deleteCliente(${c.id})">Remover</button>
      </td>
    </tr>
  `).join('');
}

async function deleteCliente(id) {
  if (!confirm('Remover este cliente?')) return;
  try {
    await fetch(`${API}/clientes/${id}`, { method: 'DELETE' });
    loadClientes();
  } catch (err) {
    alert('Erro ao remover cliente');
  }
}

function editCliente(id, nome, email) {
  editingId = id;
  document.getElementById('cliente-id').value = id;
  document.getElementById('cliente-nome').value = nome;
  document.getElementById('cliente-email').value = email;
  document.getElementById('cliente-cancel').style.display = 'inline-block';
}

function populateClienteSelects() {
  const selects = ['produto-cliente-select', 'favoritos-cliente-select'];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    const current = sel.value;
    sel.innerHTML = '<option value="">Selecione um cliente</option>' +
      clientes.map(c => `<option value="${c.id}" ${c.id == current ? 'selected' : ''}>${c.nome}</option>`).join('');
  });
}

function loadClientesSelect(selectId) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = '<option value="">Selecione um cliente</option>' +
    clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
}

// --- Produtos ---
async function loadProdutos() {
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    produtos = await res.json();
    renderProdutos(produtos);
  } catch (err) {
    console.error('Erro ao carregar produtos', err);
  }
}

function renderProdutos(data) {
  const grid = document.getElementById('produtos-grid');
  grid.innerHTML = data.map(p => {
    const rating = p.rating ? `${p.rating.rate} (${p.rating.count} avaliações)` : 'Sem avaliação';
    return `
      <div class="product-card">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        <h3>${p.title}</h3>
        <div class="price">$${p.price.toFixed(2)}</div>
        <div class="rating">${rating}</div>
        <button onclick="addFavorito(${p.id})">Adicionar aos Favoritos</button>
      </div>
    `;
  }).join('');
}

async function addFavorito(productId) {
  const select = document.getElementById('produto-cliente-select');
  const clienteId = select.value;
  if (!clienteId) {
    alert('Selecione um cliente primeiro');
    return;
  }
  try {
    const res = await fetch(`${API}/clientes/${clienteId}/favoritos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Erro ao adicionar favorito');
      return;
    }
    alert('Produto adicionado aos favoritos!');
  } catch (err) {
    alert('Erro ao adicionar favorito');
  }
}

// --- Favoritos ---
document.getElementById('favoritos-cliente-select').addEventListener('change', (e) => {
  if (e.target.value) loadFavoritos(e.target.value);
  else document.getElementById('favoritos-list').innerHTML = '<div class="empty-state">Selecione um cliente para ver seus favoritos</div>';
});

async function loadFavoritos(clienteId) {
  try {
    const res = await fetch(`${API}/clientes/${clienteId}/favoritos`);
    if (!res.ok) throw new Error('Erro');
    const data = await res.json();
    renderFavoritos(data, clienteId);
  } catch (err) {
    document.getElementById('favoritos-list').innerHTML = '<div class="empty-state">Erro ao carregar favoritos</div>';
  }
}

function renderFavoritos(data, clienteId) {
  const container = document.getElementById('favoritos-list');
  if (data.length === 0) {
    container.innerHTML = '<div class="empty-state">Nenhum favorito ainda</div>';
    return;
  }
  container.innerHTML = data.map(f => `
    <div class="favorito-item">
      <img src="${f.imagem}" alt="${f.titulo}" loading="lazy">
      <div class="info">
        <h3>${f.titulo}</h3>
        <div class="price">$${f.preco.toFixed(2)}</div>
        ${f.avaliacao ? `<div class="rating">${f.avaliacao.rate} (${f.avaliacao.count} avaliações)</div>` : ''}
      </div>
      <button class="btn-danger" onclick="removeFavorito(${clienteId}, ${f.id})">Remover</button>
    </div>
  `).join('');
}

async function removeFavorito(clienteId, productId) {
  if (!confirm('Remover dos favoritos?')) return;
  try {
    await fetch(`${API}/clientes/${clienteId}/favoritos/${productId}`, { method: 'DELETE' });
    loadFavoritos(clienteId);
  } catch (err) {
    alert('Erro ao remover favorito');
  }
}

// --- Init ---
loadClientes();
