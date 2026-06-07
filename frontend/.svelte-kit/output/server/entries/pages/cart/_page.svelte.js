import { b as ensure_array_like, c as attr, e as escape_html } from "../../../chunks/root.js";
import { g as getCartStore } from "../../../chunks/cart.svelte.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const cart = getCartStore();
    $$renderer2.push(`<div class="page-header"><h1>Shopping Cart</h1></div> `);
    if (cart.items.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="empty-state"><p>Your cart is empty.</p> <a href="/products"><button class="primary" style="margin-top:1rem;">Browse Products</button></a></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="cart-list svelte-k7hhd7"><!--[-->`);
      const each_array = ensure_array_like(cart.items);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let item = each_array[$$index];
        $$renderer2.push(`<div class="cart-item svelte-k7hhd7">`);
        if (item.product) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="cart-item-img svelte-k7hhd7"><img${attr("src", item.product.image)}${attr("alt", item.product.title)} class="svelte-k7hhd7"/></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <div class="cart-item-info svelte-k7hhd7"><a${attr("href", `/products/${item.product_id}`)} class="cart-item-title svelte-k7hhd7">${escape_html(item.product?.title ?? `Product #${item.product_id}`)}</a> `);
        if (item.product) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="cart-item-unit svelte-k7hhd7">$${escape_html(item.product.price.toFixed(2))} each</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div> <div class="cart-item-qty svelte-k7hhd7"><button class="qty-btn btn-animate svelte-k7hhd7"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path></svg></button> <span class="qty-val svelte-k7hhd7">${escape_html(item.quantity)}</span> <button class="qty-btn btn-animate svelte-k7hhd7"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg></button></div> <span class="cart-item-total svelte-k7hhd7">$${escape_html((item.product?.price ?? 0 * item.quantity).toFixed(2))}</span> <button class="cart-item-remove btn-animate svelte-k7hhd7" title="Remove"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="cart-summary svelte-k7hhd7"><span class="cart-total-label svelte-k7hhd7">Total: <strong class="svelte-k7hhd7">$${escape_html(cart.total.toFixed(2))}</strong></span> <button class="primary cart-checkout svelte-k7hhd7">Checkout (Demo)</button></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
