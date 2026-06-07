import { e as escape_html, c as attr, a as attr_class, b as ensure_array_like, d as clsx } from "../../../chunks/root.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
/* empty css                                                        */
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let categories = [];
    let page = 1;
    let totalPages = 1;
    let total = 0;
    let selectedCategory = "";
    let search = "";
    $$renderer2.push(`<div class="page-header"><h1>Products</h1> <span style="color:var(--text-muted);font-size:0.9rem;">${escape_html(total)} products found</span></div> <div class="filter-bar"><input placeholder="Search..."${attr("value", search)} style="max-width:250px;"/> <button${attr_class(clsx("primary"))}>All</button> <!--[-->`);
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
    $$renderer2.push(`<!--]--> <div class="pagination svelte-1dj9mz1"><button class="secondary"${attr("disabled", page <= 1, true)}>← Previous</button> <span style="color:var(--text-muted);font-size:0.875rem;">Page ${escape_html(page)} of ${escape_html(totalPages)}</span> <button class="secondary"${attr("disabled", page >= totalPages, true)}>Next →</button></div>`);
  });
}
export {
  _page as default
};
