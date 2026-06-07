import { e as escape_html } from "../../../../chunks/root.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
/* empty css                                                           */
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { params } = $$props;
    $$renderer2.push(`<div class="page-header"><h1 style="text-transform:capitalize;">${escape_html(params.slug.replace("-", " "))}</h1></div> `);
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
