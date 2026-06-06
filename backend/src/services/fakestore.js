import axios from 'axios';

const API_BASE = 'https://fakestoreapi.com';

export async function getProducts() {
  const { data } = await axios.get(`${API_BASE}/products`);
  return data;
}

export async function getProduct(id) {
  const { data } = await axios.get(`${API_BASE}/products/${id}`);
  return data;
}
