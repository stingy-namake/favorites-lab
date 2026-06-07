import "clsx";
import { a as api } from "./api.js";
let items = [];
let loading = false;
let lastRemoved = null;
let undoTimeout = null;
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
  const item = items.find((i) => i.id === id);
  if (item) {
    lastRemoved = {
      product_id: item.product_id,
      quantity: item.quantity,
      id: item.id
    };
    if (undoTimeout) clearTimeout(undoTimeout);
    undoTimeout = setTimeout(
      () => {
        lastRemoved = null;
      },
      4e3
    );
  }
  await api.cart.remove(id);
  await fetchCart();
}
async function undoRemove() {
  if (!lastRemoved) return;
  await add(lastRemoved.product_id, lastRemoved.quantity);
  lastRemoved = null;
  if (undoTimeout) {
    clearTimeout(undoTimeout);
    undoTimeout = null;
  }
}
function dismissUndo() {
  lastRemoved = null;
  if (undoTimeout) {
    clearTimeout(undoTimeout);
    undoTimeout = null;
  }
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
    get lastRemoved() {
      return lastRemoved;
    },
    fetchCart,
    add,
    update,
    remove,
    undoRemove,
    dismissUndo
  };
}
export {
  getCartStore as g
};
