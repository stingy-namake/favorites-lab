import "clsx";
import { s as ssr_context } from "../../chunks/context.js";
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
  $$renderer.push(`<div class="hero svelte-1uha8ag"><h1 class="svelte-1uha8ag">kishin echoes</h1> <p class="svelte-1uha8ag">Browse our curated collection of products</p></div> `);
  Carousel($$renderer);
  $$renderer.push(`<!---->`);
}
export {
  _page as default
};
