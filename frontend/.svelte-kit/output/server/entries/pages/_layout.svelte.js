import "clsx";
import { a as attr_class, e as escape_html, b as ensure_array_like, c as attr, d as derived } from "../../chunks/root.js";
import { g as getCartStore } from "../../chunks/cart.svelte.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
function CartPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open } = $$props;
    const cart = getCartStore();
    if (open) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="backdrop svelte-tn8nrs"></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div${attr_class("panel svelte-tn8nrs", void 0, { "open": open })}><div class="panel-header svelte-tn8nrs"><h2 class="svelte-tn8nrs">Cart (${escape_html(cart.count)})</h2> <button class="panel-close svelte-tn8nrs"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg></button></div> <div class="panel-body svelte-tn8nrs"><!--[-->`);
    const each_array = ensure_array_like(cart.items);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      $$renderer2.push(`<div class="panel-item svelte-tn8nrs">`);
      if (item.product) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="panel-item-img svelte-tn8nrs"><img${attr("src", item.product.image)}${attr("alt", item.product.title)} class="svelte-tn8nrs"/></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="panel-item-info svelte-tn8nrs"><span class="panel-item-title svelte-tn8nrs">${escape_html(item.product?.title ?? `Product #${item.product_id}`)}</span> <div class="panel-item-qty svelte-tn8nrs"><button class="qty-btn btn-animate svelte-tn8nrs"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path></svg></button> <span class="qty-val svelte-tn8nrs">${escape_html(item.quantity)}</span> <button class="qty-btn btn-animate svelte-tn8nrs"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg></button> <button class="qty-trash btn-animate svelte-tn8nrs" title="Remove"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div></div> <span class="panel-item-price svelte-tn8nrs">$${escape_html((item.product?.price ?? 0).toFixed(2))}</span></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (cart.items.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="panel-empty svelte-tn8nrs">Your cart is empty.</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (cart.items.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="panel-footer svelte-tn8nrs"><div class="panel-total svelte-tn8nrs"><span>Total</span> <strong class="svelte-tn8nrs">$${escape_html(cart.total.toFixed(2))}</strong></div> <button class="primary panel-checkout svelte-tn8nrs">GO TO CART</button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function Snackbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const cart = getCartStore();
    if (cart.lastRemoved) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="snackbar svelte-1srpoyx"><span class="snackbar-msg svelte-1srpoyx">Item removed from cart</span> <button class="snackbar-undo svelte-1srpoyx">Undo</button> <button class="snackbar-dismiss svelte-1srpoyx"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg></button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
let selectedProduct = null;
function getProductOverlay() {
  function open(product) {
    selectedProduct = product;
  }
  function close() {
    selectedProduct = null;
  }
  return {
    get selectedProduct() {
      return selectedProduct;
    },
    open,
    close
  };
}
function ProductOverlay($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const overlay = getProductOverlay();
    let p = derived(() => overlay.selectedProduct);
    if (p()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="overlay svelte-kt84xv"><div class="overlay-content svelte-kt84xv"><button class="overlay-close svelte-kt84xv" aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"></path></svg></button> <div class="overlay-layout svelte-kt84xv"><div class="overlay-img svelte-kt84xv"><img${attr("src", p().image)}${attr("alt", p().title)} class="svelte-kt84xv"/></div> <div class="overlay-info svelte-kt84xv"><span class="overlay-cat svelte-kt84xv">${escape_html(p().category)}</span> <h2 class="overlay-title svelte-kt84xv">${escape_html(p().title)}</h2> <div class="overlay-rating svelte-kt84xv"><svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg> <span>${escape_html(p().rating.rate.toFixed(1))}</span> <span class="overlay-count svelte-kt84xv">(${escape_html(p().rating.count)} reviews)</span></div> <p class="overlay-desc svelte-kt84xv">${escape_html(p().description)}</p> <div class="overlay-foot svelte-kt84xv"><span class="overlay-price svelte-kt84xv">$${escape_html(p().price.toFixed(2))}</span> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    let cartOpen = false;
    $$renderer2.push(`<nav class="nav"><a href="/" class="nav-brand">kishin echoes</a> <div class="nav-links"><a href="/products">PRODUCTS</a> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="nav-right"><div class="accent-wrap"><button class="accent-trigger" title="Accent color"></button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <button class="nav-theme">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>`);
    }
    $$renderer2.push(`<!--]--></button> `);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<a href="/auth/login"><button class="nav-btn">LOGIN</button></a> <a href="/auth/signup"><button class="nav-btn nav-btn-primary">SIGN UP</button></a>`);
    }
    $$renderer2.push(`<!--]--></div></nav> `);
    CartPanel($$renderer2, { open: cartOpen });
    $$renderer2.push(`<!----> `);
    Snackbar($$renderer2);
    $$renderer2.push(`<!----> `);
    ProductOverlay($$renderer2);
    $$renderer2.push(`<!----> <main class="container" style="padding-top:2rem;padding-bottom:4rem;">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main> <footer class="footer svelte-12qhfyh"><div class="container"><span class="svelte-12qhfyh">kishin echoes · powered by FakeStoreAPI</span></div></footer>`);
  });
}
export {
  _layout as default
};
