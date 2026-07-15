// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import { unified } from "@astrojs/markdown-remark";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import { rehypeRougeCompat } from "./src/lib/rehype-rouge-compat.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseFrontmatter } from "@astrojs/markdown-remark";
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
 * Jekyll-era posts use `.markdown`; Astro only registers `.md` by default.
 * Register the same markdown pipeline for the legacy extension.
 */
function legacyMarkdownExtension() {
    /** @type {import('astro').ContentEntryType} */
    const markdownLike = {
        extensions: [".markdown"],
        async getEntryInfo({ contents, fileUrl }) {
            const parsed = parseFrontmatter(contents, {
                // filename helps error messages
                filename: fileURLToPath(fileUrl),
            });
            return {
                data: parsed.frontmatter,
                body: parsed.content.trim(),
                slug: parsed.frontmatter?.slug,
                rawData: parsed.rawFrontmatter,
            };
        },
        handlePropagation: true,
        async getRenderFunction(config) {
            const { markdown, image } = config;
            const processor = await markdown.processor.createRenderer({
                image,
                syntaxHighlight: markdown.syntaxHighlight,
                shikiConfig: markdown.shikiConfig,
                gfm: markdown.gfm,
                smartypants: markdown.smartypants,
            });
            return async function renderToString(entry) {
                const result = await processor.render(entry.body ?? "", {
                    frontmatter: entry.data,
                    fileURL: entry.filePath ? pathToFileURL(entry.filePath) : undefined,
                });
                return {
                    html: result.code,
                    metadata: {
                        ...result.metadata,
                        imagePaths: (result.metadata.localImagePaths ?? []).concat(
                            result.metadata.remoteImagePaths ?? []
                        ),
                    },
                };
            };
        },
    };

    return {
        name: "legacy-markdown-extension",
        hooks: {
            "astro:config:setup"({ addContentEntryType }) {
                addContentEntryType(markdownLike);
            },
        },
    };
}

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
        legacyMarkdownExtension(),
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
            // raw before slug so ids apply to raw HTML headings too when possible
            rehypePlugins: [rehypeRaw, rehypeSlug, rehypeRougeCompat],
        }),
        // Prism emits syntax tokens; rehypeRougeCompat preserves the legacy
        // Rouge wrapper classes consumed by styles/syntax.scss.
        syntaxHighlight: "prism",
    },
    vite: {
        // Expose release to client entries (Sentry). Prefer env override in CI.
        define: {
            "import.meta.env.PUBLIC_SENTRY_RELEASE": JSON.stringify(
                process.env.PUBLIC_SENTRY_RELEASE || sentryRelease()
            ),
        },
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
