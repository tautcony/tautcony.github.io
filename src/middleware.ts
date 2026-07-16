import { defineMiddleware } from "astro:middleware";

/**
 * Astro's static `preserve` format emits tcupdate.html, while the dev server
 * resolves the source page as /tcupdate/. Keep the published URL usable in
 * both environments without changing the generated production artifact.
 */
export const onRequest = defineMiddleware((context, next) => {
    if (import.meta.env.DEV && context.url.pathname === "/tcupdate.html") {
        return context.rewrite(new URL("/tcupdate/", context.url));
    }

    return next();
});
