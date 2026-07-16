import { defineMiddleware } from "astro:middleware";

/**
 * Dev-only rewrites: static `preserve` / redirects map historical `.html` URLs to
 * the pretty routes the dev server actually serves.
 */
export const onRequest = defineMiddleware((context, next) => {
    if (import.meta.env.DEV) {
        const devPath = {
            "/tcupdate.html": "/tcupdate/",
            "/404.html": "/404/",
        }[context.url.pathname];
        if (devPath) return context.rewrite(new URL(devPath, context.url));
    }

    return next();
});
