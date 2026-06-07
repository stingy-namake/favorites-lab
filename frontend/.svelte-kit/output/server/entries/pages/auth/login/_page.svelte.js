import { c as attr, e as escape_html } from "../../../../chunks/root.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let email = "";
    let password = "";
    let submitting = false;
    $$renderer2.push(`<div class="auth-page svelte-1i2smtp"><div class="auth-card svelte-1i2smtp"><h1 class="svelte-1i2smtp">Welcome back</h1> <p class="auth-sub svelte-1i2smtp">Log in to your account</p> <form class="svelte-1i2smtp"><input type="email" placeholder="Email address"${attr("value", email)} required=""/> <input type="password" placeholder="Password"${attr("value", password)} required=""/> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <button type="submit" class="primary"${attr("disabled", submitting, true)} style="width:100%;padding:0.75rem;">${escape_html("LOG IN")}</button></form> <p class="auth-footer svelte-1i2smtp">Don't have an account? <a href="/auth/signup" class="svelte-1i2smtp">Sign up</a></p></div></div>`);
  });
}
export {
  _page as default
};
