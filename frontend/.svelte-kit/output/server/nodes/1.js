

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.CCwYFaw8.js","_app/immutable/chunks/C9fOaHXB.js","_app/immutable/chunks/BDpvQQCo.js","_app/immutable/chunks/DbS0SYjl.js"];
export const stylesheets = [];
export const fonts = [];
