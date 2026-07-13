/**
 * Map Vite's manifest.json → _data/assets.json for Jekyll Liquid templates.
 *
 * Expected keys (entry names from vite.config.mjs):
 *   tc-blog, page404, tcupdate
 *
 * Also mtimes Liquid includes that emit asset tags so `jekyll serve -I`
 * rebuilds pages (data-only changes are invisible to incremental regen).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/** @type {Record<string, string>} entryName → manifest key */
const entrySources = {
    "tc-blog": "ts/entries/blog.ts",
    page404: "ts/entries/page404.ts",
    tcupdate: "ts/entries/tcupdate.jsx",
};

/**
 * @param {{ quiet?: boolean }} [opts]
 * @returns {Record<string, { js: string, css: string | null, imports: string[] }>}
 */
export function syncAssetData(opts = {}) {
    const quiet = opts.quiet === true;
    const manifestCandidates = [
        path.join(root, "assets/build/.vite/manifest.json"),
        path.join(root, "assets/build/manifest.json"),
    ];

    const manifestPath = manifestCandidates.find(p => fs.existsSync(p));
    if (!manifestPath) {
        throw new Error("Vite manifest not found under assets/build/");
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const assets = {};

    for (const [name, src] of Object.entries(entrySources)) {
        const chunk = manifest[src];
        if (!chunk) {
            throw new Error(`manifest missing entry for ${src}`);
        }
        const cssList = chunk.css || [];
        assets[name] = {
            js: `/assets/build/${chunk.file}`,
            css: cssList.length > 0 ? `/assets/build/${cssList[0]}` : null,
            imports: (chunk.imports || [])
                .map(id => {
                    const imp = manifest[id];
                    return imp ? `/assets/build/${imp.file}` : null;
                })
                .filter(Boolean),
        };
    }

    const outDir = path.join(root, "_data");
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, "assets.json");
    const next = `${JSON.stringify(assets, null, 2)}\n`;
    const prev = fs.existsSync(outFile) ? fs.readFileSync(outFile, "utf8") : null;
    if (prev !== next) {
        fs.writeFileSync(outFile, next);
    }

    // Force Jekyll (esp. incremental) to re-render includes that emit asset tags.
    const touchTargets = [
        path.join(root, "_includes/vite-assets.html"),
        path.join(root, "_includes/head.html"),
        path.join(root, "_includes/footer.html"),
    ];
    const now = new Date();
    for (const file of touchTargets) {
        if (fs.existsSync(file)) {
            fs.utimesSync(file, now, now);
        }
    }

    if (!quiet) {
        console.log(`wrote ${path.relative(root, outFile)}`);
        for (const [name, meta] of Object.entries(assets)) {
            console.log(`  ${name}: js=${meta.js}${meta.css ? ` css=${meta.css}` : ""}`);
        }
    }

    return assets;
}

/** Vite plugin: keep `_data/assets.json` in sync after every build (incl. watch). */
export function vitePluginSyncAssetData() {
    let isWatch = false;
    return {
        name: "sync-asset-data",
        apply: "build",
        configResolved(config) {
            isWatch = Boolean(config.build.watch);
        },
        closeBundle() {
            try {
                syncAssetData({ quiet: isWatch });
                if (isWatch) {
                    console.log("[sync-asset-data] updated _data/assets.json");
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error(`[sync-asset-data] ${message}`);
                throw err instanceof Error ? err : new Error(message);
            }
        },
    };
}

// CLI: `node scripts/sync-asset-data.mjs`
const isCli =
    Boolean(process.argv[1]) &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
    try {
        syncAssetData();
    } catch (err) {
        console.error(`error: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
    }
}
