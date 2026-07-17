// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { site as siteConfig } from "./src/data/site.ts";
import { rehypePostEnhancements } from "./src/lib/rehype-post-enhancements.ts";

function sentryRelease() {
    try {
        const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
        let sha = "unknown";
        try {
            sha = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
                encoding: "utf8",
            }).trim();
        } catch {
            /* Docker / shallow without git */
        }
        return `tc-blog@${pkg.version}+${sha}`;
    } catch {
        return "tc-blog@unknown";
    }
}

/** @type {import('astro').RehypePlugins} */
const rehypePlugins = [
    rehypeRaw,
    // Math HTML from remark-math → KaTeX (before slug/autolink polish).
    rehypeKatex,
    rehypeSlug,
    ...(siteConfig.anchorjs
        ? [
            [
                rehypeAutolinkHeadings,
                {
                    behavior: "append",
                    properties: {
                        className: ["anchorjs-link"],
                        ariaHidden: "true",
                        tabIndex: -1,
                    },
                    content: { type: "text", value: "¶" },
                },
            ],
        ]
        : []),
    // // asides, external class, table wrap, pdf-embed mount shell
    rehypePostEnhancements,
];

/**
 * Astro SSG config for TC Blog.
 * Canonical host comes from `src/data/site.ts` (`site` / `base` mirror url + baseurl).
 * Styles: `src/styles/`; browser code: `src/client/`; build helpers: `src/lib/`.
 */
export default defineConfig({
    site: siteConfig.url,
    base: siteConfig.baseurl === "" ? "/" : siteConfig.baseurl,
    trailingSlash: "always",
    publicDir: "public",
    outDir: "dist",
    build: {
        // preserve: about/index → about/index.html; 404.astro → 404.html; etc.
        // /tcupdate/ is pages/tcupdate/index.astro; /tcupdate.html is public/tcupdate.html → redirect.
        format: "preserve",
    },
    markdown: {
        processor: unified({
            gfm: true,
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins,
        }),
        // Native Astro Prism: pre.language-* > code.language-* > .token (see src/styles/syntax.scss).
        syntaxHighlight: "prism",
    },
    vite: {
        build: {
            // The isolated 404 entry includes the Three.js WebGL renderer.
            chunkSizeWarningLimit: 550,
        },
        // Expose release to client entries (Sentry). Prefer env override in CI.
        define: {
            "import.meta.env.PUBLIC_SENTRY_RELEASE": JSON.stringify(
                process.env.PUBLIC_SENTRY_RELEASE || sentryRelease()
            ),
        },
        resolve: {
            extensions: [".mjs", ".js", ".ts", ".json", ".scss", ".css"],
        },
    },
});
