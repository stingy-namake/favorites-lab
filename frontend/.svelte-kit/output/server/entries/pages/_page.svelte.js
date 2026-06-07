import "clsx";
import { d as ssr_context } from "../../chunks/root.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function Carousel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    onDestroy(() => stop());
    function stop() {
    }
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="empty-state">Loading...</p>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _page($$renderer) {
  $$renderer.push(`<div class="hero svelte-1uha8ag"><h1 class="svelte-1uha8ag">FakeStore</h1> <p class="svelte-1uha8ag">Browse our curated collection of products</p> <a href="/products"><button class="primary" style="margin-top:1rem;padding:0.75rem 2rem;">Shop All Products</button></a></div> `);
  Carousel($$renderer);
  $$renderer.push(`<!---->`);
}
export {
  _page as default
};
