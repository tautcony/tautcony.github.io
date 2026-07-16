// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import { rehypeRougeCompat } from "./src/lib/rehype-rouge-compat.mjs";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

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

/**
 * Astro SSG config for TC Blog.
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
    build: {
        // Keep bare .html paths (e.g. tcupdate.html, 404.html) instead of directories.
        format: "preserve",
    },
    markdown: {
        // Full content pipeline lands in M1; lock plugin versions from M0.
        processor: unified({
            gfm: true,
            remarkPlugins: [remarkGfm],
            // raw before slug so ids apply to raw HTML headings too when possible
            rehypePlugins: [rehypeRaw, rehypeSlug, rehypeRougeCompat],
        }),
        // Prism emits syntax tokens; rehypeRougeCompat preserves the legacy
        // Rouge wrapper classes consumed by styles/syntax.scss.
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

