

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.BsOv9aiy.js","_app/immutable/chunks/Cqr37zqI.js","_app/immutable/chunks/CIHkJHWi.js","_app/immutable/chunks/BsFscbSx.js"];
export const stylesheets = [];
export const fonts = [];
