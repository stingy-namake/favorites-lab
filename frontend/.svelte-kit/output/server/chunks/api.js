const BASE = "/api";
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
async function request(path, opts = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...opts.headers
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}
const api = {
  cart: {
    list: () => request("/cart"),
    add: (product_id, quantity = 1) => request("/cart", { method: "POST", body: JSON.stringify({ product_id, quantity }) }),
    update: (id, quantity) => request(`/cart/${id}`, { method: "PUT", body: JSON.stringify({ quantity }) }),
    remove: (id) => request(`/cart/${id}`, { method: "DELETE" })
  },
  favorites: {
    list: () => request("/favorites"),
    add: (product_id) => request("/favorites", { method: "POST", body: JSON.stringify({ product_id }) }),
    remove: (productId) => request(`/favorites/${productId}`, { method: "DELETE" })
  }
};
export {
  api as a
};
