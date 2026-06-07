import "clsx";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="page-header"><h1>Admin Dashboard</h1><span style="color:var(--text-muted);font-size:0.9rem;">Manage users</span></div> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="empty-state">Loading users...</p>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
