/**
 * Compare static asset URL + size/hash between legacy manifest and Astro dist.
 *
 * Usage:
 *   node scripts/compare-assets.mjs --self-test
 *   node scripts/compare-assets.mjs --legacy mig/fixtures/assets-jekyll.json --dist dist
 *
 * Manifest format:
 *   { "/img/foo.png": { "size": 123, "sha256": "..." }, ... }
 *
 * Exit 0 on match; 1 on mismatch.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/** Asset path prefixes typically mirrored into public/ and expected stable. */
const ASSET_PREFIXES = [
    "/img/",
    "/attach/",
    "/fonts/",
    "/css/",
    "/json/",
    "/arknights/",
    "/contents/",
    "/favicon.ico",
    "/CNAME",
    "/robots.txt",
];

export function sha256File(filePath) {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(buf).digest("hex");
}

export function shouldTrackAsset(urlPath) {
    const p = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
    return ASSET_PREFIXES.some((prefix) => {
        if (prefix.endsWith("/")) return p.startsWith(prefix) || p === prefix.slice(0, -1);
        return p === prefix;
    });
}

export function collectDistAssets(distDir) {
    /** @type {Record<string, { size: number, sha256: string }>} */
    const out = {};
    if (!fs.existsSync(distDir)) return out;

    function walk(dir) {
        for (const name of fs.readdirSync(dir)) {
            const full = path.join(dir, name);
            const st = fs.statSync(full);
            if (st.isDirectory()) {
                walk(full);
                continue;
            }
            const rel = `/${path.relative(distDir, full).split(path.sep).join("/")}`;
            if (!shouldTrackAsset(rel)) continue;
            // Skip hashed Vite/Astro build outputs under /_astro/
            if (rel.startsWith("/_astro/")) continue;
            out[rel] = { size: st.size, sha256: sha256File(full) };
        }
    }
    walk(distDir);
    return out;
}

export function diffAssets(legacy, current, { ignoreHash = false } = {}) {
    const missing = [];
    const changed = [];
    const extra = [];

    for (const [url, meta] of Object.entries(legacy)) {
        if (!(url in current)) {
            missing.push(url);
            continue;
        }
        const cur = current[url];
        if (meta.size !== cur.size || (!ignoreHash && meta.sha256 !== cur.sha256)) {
            changed.push({ url, legacy: meta, current: cur });
        }
    }
    for (const url of Object.keys(current)) {
        if (!(url in legacy)) extra.push(url);
    }
    return {
        missing: missing.sort(),
        extra: extra.sort(),
        changed,
        ok: missing.length === 0 && extra.length === 0 && changed.length === 0,
    };
}

function parseArgs(argv) {
    const out = { selfTest: false, legacy: null, dist: "dist", ignoreHash: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--self-test") out.selfTest = true;
        else if (a === "--legacy") out.legacy = argv[++i];
        else if (a === "--dist") out.dist = argv[++i];
        else if (a === "--ignore-hash") out.ignoreHash = true;
        else if (a === "--help" || a === "-h") out.help = true;
    }
    return out;
}

function selfTest() {
    let failed = 0;

    if (!shouldTrackAsset("/img/x.png") || shouldTrackAsset("/_astro/x.js")) {
        console.error("shouldTrackAsset self-test failed");
        failed += 1;
    }

    const legacy = {
        "/img/a.png": { size: 10, sha256: "aaa" },
        "/img/b.png": { size: 20, sha256: "bbb" },
    };
    const current = {
        "/img/a.png": { size: 10, sha256: "aaa" },
        "/img/b.png": { size: 21, sha256: "bbc" },
        "/img/c.png": { size: 1, sha256: "ccc" },
    };
    const d = diffAssets(legacy, current);
    if (d.ok || d.missing.length !== 0 || d.extra.length !== 1 || d.changed.length !== 1) {
        console.error("diffAssets self-test failed", d);
        failed += 1;
    }

    const d2 = diffAssets(
        { "/img/a.png": { size: 1, sha256: "x" } },
        { "/img/a.png": { size: 1, sha256: "y" } },
        { ignoreHash: true }
    );
    if (!d2.ok) {
        console.error("ignoreHash self-test failed", d2);
        failed += 1;
    }

    if (failed) {
        console.error(`[compare-assets] self-test FAILED (${failed})`);
        process.exit(1);
    }
    console.log("[compare-assets] self-test OK");
    process.exit(0);
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        console.log(
            "Usage: node scripts/compare-assets.mjs [--self-test] --legacy <json> --dist <dir> [--ignore-hash]"
        );
        process.exit(0);
    }
    if (args.selfTest) {
        selfTest();
        return;
    }
    if (!args.legacy) {
        console.error("error: --legacy <json> required (or --self-test)");
        process.exit(1);
    }

    const legacyPath = path.isAbsolute(args.legacy) ? args.legacy : path.join(root, args.legacy);
    const distPath = path.isAbsolute(args.dist) ? args.dist : path.join(root, args.dist);

    if (!fs.existsSync(legacyPath)) {
        console.error(
            `error: legacy manifest not found: ${legacyPath}\n` +
                "(Generate in M3: mig/fixtures/assets-jekyll.json)"
        );
        process.exit(1);
    }
    if (!fs.existsSync(distPath)) {
        console.error(`error: dist not found: ${distPath}`);
        process.exit(1);
    }

    const legacy = JSON.parse(fs.readFileSync(legacyPath, "utf8"));
    const current = collectDistAssets(distPath);
    const { missing, extra, changed, ok } = diffAssets(legacy, current, {
        ignoreHash: args.ignoreHash,
    });

    console.log(
        `[compare-assets] legacy=${Object.keys(legacy).length} dist=${Object.keys(current).length}`
    );
    if (missing.length) {
        console.error("MISSING:");
        for (const u of missing) console.error(`  - ${u}`);
    }
    if (extra.length) {
        console.error("EXTRA:");
        for (const u of extra) console.error(`  + ${u}`);
    }
    if (changed.length) {
        console.error("CHANGED size/hash:");
        for (const c of changed) {
            console.error(
                `  ~ ${c.url} size ${c.legacy.size}→${c.current.size} sha ${c.legacy.sha256.slice(0, 8)}→${c.current.sha256.slice(0, 8)}`
            );
        }
    }
    if (!ok) process.exit(1);
    console.log("[compare-assets] OK");
    process.exit(0);
}

main();
