import { c as attr, a as attr_class, b as ensure_array_like, d as clsx, e as escape_html } from "../../chunks/root.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
/* empty css                                                     */
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let categories = [];
    let selectedCategory = "";
    let search = "";
    $$renderer2.push(`<div class="hero svelte-1uha8ag"><h1 class="svelte-1uha8ag">FakeStore</h1> <p class="svelte-1uha8ag">Browse our curated collection of products</p></div> <div class="filter-bar"><input placeholder="Search products..."${attr("value", search)} style="max-width:280px;"/> <button${attr_class(clsx("primary"))}>All</button> <!--[-->`);
    const each_array = ensure_array_like(categories);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let cat = each_array[$$index];
      $$renderer2.push(`<button${attr_class(clsx(selectedCategory === cat ? "primary" : "secondary"))}>${escape_html(cat)}</button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="empty-state">Loading...</p>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
