
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/auth" | "/auth/login" | "/auth/signup" | "/cart" | "/categories" | "/categories/[slug]" | "/favorites" | "/products" | "/products/[id]";
		RouteParams(): {
			"/categories/[slug]": { slug: string };
			"/products/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { slug?: string | undefined; id?: string | undefined };
			"/admin": Record<string, never>;
			"/auth": Record<string, never>;
			"/auth/login": Record<string, never>;
			"/auth/signup": Record<string, never>;
			"/cart": Record<string, never>;
			"/categories": { slug?: string | undefined };
			"/categories/[slug]": { slug: string };
			"/favorites": Record<string, never>;
			"/products": { id?: string | undefined };
			"/products/[id]": { id: string }
		};
		Pathname(): "/" | "/admin" | "/auth/login" | "/auth/signup" | "/cart" | `/categories/${string}` & {} | "/favorites" | "/products" | `/products/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}