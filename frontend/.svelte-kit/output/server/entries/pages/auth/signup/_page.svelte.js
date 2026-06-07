import { c as attr, e as escape_html } from "../../../../chunks/root.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let name = "";
    let email = "";
    let password = "";
    let submitting = false;
    $$renderer2.push(`<div class="auth-page svelte-ff5z5w"><div class="auth-card svelte-ff5z5w"><h1 class="svelte-ff5z5w">Create account</h1> <p class="auth-sub svelte-ff5z5w">Join FakeStore today</p> <form class="svelte-ff5z5w"><input type="text" placeholder="Full name"${attr("value", name)} required=""/> <input type="email" placeholder="Email address"${attr("value", email)} required=""/> <input type="password" placeholder="Password (min 6 characters)"${attr("value", password)} required=""${attr("minlength", 6)}/> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <button type="submit" class="primary"${attr("disabled", submitting, true)} style="width:100%;padding:0.75rem;">${escape_html("SIGN UP")}</button></form> <p class="auth-footer svelte-ff5z5w">Already have an account? <a href="/auth/login" class="svelte-ff5z5w">Log in</a></p></div></div>`);
  });
}
export {
  _page as default
};
