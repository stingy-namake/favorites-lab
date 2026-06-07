import "clsx";
import { a as api } from "./api.js";
let items = [];
let loading = false;
async function fetchCart() {
  {
    items = [];
    return;
  }
}
async function add(productId, quantity = 1) {
  const item = await api.cart.add(productId, quantity);
  await fetchCart();
  return item;
}
async function update(id, quantity) {
  await api.cart.update(id, quantity);
  await fetchCart();
}
async function remove(id) {
  await api.cart.remove(id);
  await fetchCart();
}
function total() {
  return items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
}
function getCartStore() {
  return {
    get items() {
      return items;
    },
    get loading() {
      return loading;
    },
    get count() {
      return items.reduce((s, i) => s + i.quantity, 0);
    },
    get total() {
      return total();
    },
    fetchCart,
    add,
    update,
    remove
  };
}
export {
  getCartStore as g
};
