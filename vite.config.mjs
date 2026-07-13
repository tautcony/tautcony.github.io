import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { vitePluginSyncAssetData } from "./scripts/sync-asset-data.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * Multi-entry frontend build for the Jekyll site.
 * Outputs assets under assets/build/ (hashed in production) and keeps
 * `_data/assets.json` in sync for Liquid (`vite-assets.html`).
 */
export default defineConfig(({ mode }) => {
    const isProd = mode === "production";

    return {
        root,
        publicDir: false,
        base: "/",
        plugins: [vueJsx(), vitePluginSyncAssetData()],
        resolve: {
            extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".less", ".scss", ".css"],
        },
        css: {
            preprocessorOptions: {
                less: {},
                scss: {
                    quietDeps: true,
                    silenceDeprecations: ["import", "mixed-decls", "global-builtin", "legacy-js-api"],
                },
            },
            devSourcemap: !isProd,
        },
        build: {
            outDir: path.join(root, "assets/build"),
            emptyOutDir: true,
            manifest: true,
            sourcemap: !isProd,
            target: "es2020",
            cssCodeSplit: true,
            modulePreload: { polyfill: false },
            rollupOptions: {
                input: {
                    "tc-blog": path.join(root, "ts/entries/blog.ts"),
                    page404: path.join(root, "ts/entries/page404.ts"),
                    tcupdate: path.join(root, "ts/entries/tcupdate.jsx"),
                },
                output: {
                    entryFileNames: isProd ? "js/[name].[hash].js" : "js/[name].js",
                    chunkFileNames: isProd ? "js/chunks/[name].[hash].js" : "js/chunks/[name].js",
                    assetFileNames: assetInfo => {
                        const name = assetInfo.name || "asset";
                        if (name.endsWith(".css")) {
                            return isProd ? "css/[name].[hash][extname]" : "css/[name][extname]";
                        }
                        return isProd ? "media/[name].[hash][extname]" : "media/[name][extname]";
                    },
                },
            },
        },
    };
});
