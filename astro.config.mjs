// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import { unified } from "@astrojs/markdown-remark";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";

/**
 * Astro SSG config for TC Blog migration (M0+).
 * Dual-stack: Jekyll remains the production builder until M4/PR5.
 * Styles stay at repo-root `styles/`; client entries stay at `ts/`.
 *
 * Astro 7 defaults to Sätteri; use `@astrojs/markdown-remark` `unified()` so
 * remark/rehype plugins remain available (see mig/05).
 */
export default defineConfig({
    site: "https://tautcony.xyz",
    base: "/",
    trailingSlash: "always",
    publicDir: "public",
    outDir: "dist",
    integrations: [
        vue({
            // tcupdate uses Vue JSX entry; only mount on that page (M3).
            jsx: true,
        }),
    ],
    build: {
        // Keep bare .html paths (e.g. tcupdate.html, 404.html) instead of directories.
        format: "preserve",
    },
    markdown: {
        // Full content pipeline lands in M1; lock plugin versions from M0.
        processor: unified({
            gfm: true,
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeRaw],
        }),
        // Prefer class-compatible highlighting later; disable shiki default for now.
        syntaxHighlight: false,
    },
    vite: {
        resolve: {
            extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".scss", ".css"],
        },
        css: {
            preprocessorOptions: {
                scss: {
                    quietDeps: true,
                    silenceDeprecations: ["import", "mixed-decls", "global-builtin", "legacy-js-api"],
                },
            },
        },
    },
});
