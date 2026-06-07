import { b as ensure_array_like, c as attr, e as escape_html } from "../../../chunks/root.js";
import "clsx";
import { a as api } from "../../../chunks/api.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
let items = [];
let loading = false;
async function fetchFavorites() {
  {
    items = [];
    return;
  }
}
async function add(productId) {
  await api.favorites.add(productId);
  await fetchFavorites();
}
async function remove(productId) {
  await api.favorites.remove(productId);
  await fetchFavorites();
}
function isFavorited(productId) {
  return items.some((f) => f.product_id === productId);
}
function getFavoritesStore() {
  return {
    get items() {
      return items;
    },
    get loading() {
      return loading;
    },
    get count() {
      return items.length;
    },
    fetchFavorites,
    add,
    remove,
    isFavorited
  };
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const favs = getFavoritesStore();
    $$renderer2.push(`<div class="page-header"><h1>My Favorites</h1></div> `);
    if (favs.items.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="empty-state"><p>No favorites yet.</p> <a href="/products"><button class="primary" style="margin-top:1rem;">Browse Products</button></a></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="fav-grid svelte-ud7knm"><!--[-->`);
      const each_array = ensure_array_like(favs.items);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let fav = each_array[$$index];
        $$renderer2.push(`<div class="fav-item svelte-ud7knm">`);
        if (fav.product) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="fav-item-img svelte-ud7knm"><img${attr("src", fav.product.image)}${attr("alt", fav.product.title)} class="svelte-ud7knm"/></div> <div class="fav-item-body svelte-ud7knm"><a${attr("href", `/products/${fav.product_id}`)} class="fav-item-title svelte-ud7knm">${escape_html(fav.product.title)}</a> <span class="fav-item-price svelte-ud7knm">$${escape_html(fav.product.price.toFixed(2))}</span> <div class="fav-item-actions svelte-ud7knm"><button class="primary" style="flex:1;font-size:0.8rem;font-weight:700;">ADD TO CART</button> <button class="secondary" style="font-size:0.8rem;">REMOVE</button></div></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
