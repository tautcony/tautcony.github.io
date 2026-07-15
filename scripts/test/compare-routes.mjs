/**
 * Compare HTML/XML route sets between legacy (Jekyll) and Astro dist.
 *
 * Usage:
 *   node scripts/test/compare-routes.mjs --self-test
 *   node scripts/test/compare-routes.mjs --scope posts --legacy mig/fixtures/legacy-post-urls.txt --dist dist
 *   node scripts/test/compare-routes.mjs --scope all --legacy mig/fixtures/routes-jekyll.txt --dist dist
 *
 * Exit 0 on match; 1 on mismatch or usage error.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));

/**
 * Normalize a site path for comparison.
 * `/foo/index.html` → `/foo/` ; bare files keep extension.
 */
export function normalizeRoute(p) {
    let s = p.trim().replace(/\\/g, "/");
    if (!s.startsWith("/")) s = `/${s}`;
    if (s.endsWith("/index.html")) {
        s = `${s.slice(0, -"index.html".length)}`;
    }
    // Ensure directory-style trailing slash except for extension files.
    const base = path.posix.basename(s);
    if (base && !base.includes(".") && !s.endsWith("/")) {
        s = `${s}/`;
    }
    return s;
}

export function readRouteList(filePath) {
    const text = fs.readFileSync(filePath, "utf8");
    return text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
        .map(normalizeRoute);
}

export function collectDistRoutes(distDir) {
    const routes = [];
    if (!fs.existsSync(distDir)) {
        return routes;
    }
    function walk(dir) {
        for (const name of fs.readdirSync(dir)) {
            const full = path.join(dir, name);
            const st = fs.statSync(full);
            if (st.isDirectory()) {
                walk(full);
                continue;
            }
            if (/\.(html|xml)$/i.test(name)) {
                const rel = path.relative(distDir, full).split(path.sep).join("/");
                routes.push(normalizeRoute(`/${rel}`));
            }
        }
    }
    walk(distDir);
    return routes;
}

export function diffRoutes(legacyList, currentList, { allowlistAdd = [], allowlistRemove = [] } = {}) {
    const legacy = new Set(legacyList.map(normalizeRoute));
    const current = new Set(currentList.map(normalizeRoute));
    const allowAdd = new Set(allowlistAdd.map(normalizeRoute));
    const allowRem = new Set(allowlistRemove.map(normalizeRoute));

    const missing = [...legacy].filter((r) => !current.has(r) && !allowRem.has(r)).sort();
    const extra = [...current].filter((r) => !legacy.has(r) && !allowAdd.has(r)).sort();
    return { missing, extra, ok: missing.length === 0 && extra.length === 0 };
}

function parseArgs(argv) {
    const out = { selfTest: false, scope: "all", legacy: null, dist: "dist" };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--self-test") out.selfTest = true;
        else if (a === "--scope") out.scope = argv[++i];
        else if (a === "--legacy") out.legacy = argv[++i];
        else if (a === "--dist") out.dist = argv[++i];
        else if (a === "--help" || a === "-h") out.help = true;
    }
    return out;
}

function selfTest() {
    const cases = [
        [" /foo/index.html ", "/foo/"],
        ["/foo/index.html", "/foo/"],
        ["/feed.xml", "/feed.xml"],
        ["tcupdate.html", "/tcupdate.html"],
        ["/page2", "/page2/"],
        ["/2017/04/24/14th-ZJ-Programming-Contest/", "/2017/04/24/14th-ZJ-Programming-Contest/"],
    ];
    let failed = 0;
    for (const [input, expected] of cases) {
        const got = normalizeRoute(input);
        if (got !== expected) {
            console.error(`normalize fail: ${JSON.stringify(input)} → ${got}, want ${expected}`);
            failed += 1;
        }
    }

    const d = diffRoutes(
        ["/a/", "/b/", "/feed.xml"],
        ["/a/", "/b/", "/c/"],
        { allowlistAdd: ["/c/"], allowlistRemove: ["/feed.xml"] }
    );
    if (!d.ok || d.missing.length || d.extra.length) {
        console.error("diff allowlist self-test failed", d);
        failed += 1;
    }

    const fixture = path.join(root, "mig/fixtures/legacy-post-urls.txt");
    if (fs.existsSync(fixture)) {
        const posts = readRouteList(fixture);
        if (posts.length !== 42) {
            console.error(`legacy-post-urls.txt expected 42 lines, got ${posts.length}`);
            failed += 1;
        }
        const uniq = new Set(posts);
        if (uniq.size !== posts.length) {
            console.error("legacy-post-urls.txt has duplicate routes");
            failed += 1;
        }
    } else {
        console.warn("[compare-routes] fixture missing; skip count assert");
    }

    if (failed) {
        console.error(`[compare-routes] self-test FAILED (${failed})`);
        process.exit(1);
    }
    console.log("[compare-routes] self-test OK");
    process.exit(0);
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        console.log(`Usage: node scripts/test/compare-routes.mjs [--self-test] [--scope posts|all] --legacy <file> --dist <dir>`);
        process.exit(0);
    }
    if (args.selfTest) {
        selfTest();
        return;
    }
    if (!args.legacy) {
        console.error("error: --legacy <file> required (or --self-test)");
        process.exit(1);
    }

    const legacyPath = path.isAbsolute(args.legacy) ? args.legacy : path.join(root, args.legacy);
    const distPath = path.isAbsolute(args.dist) ? args.dist : path.join(root, args.dist);

    if (!fs.existsSync(legacyPath)) {
        console.error(`error: legacy list not found: ${legacyPath}`);
        process.exit(1);
    }

    let legacy = readRouteList(legacyPath);
    let current = collectDistRoutes(distPath);

    if (args.scope === "posts") {
        // Post routes look like /YYYY/MM/DD/slug/
        const postRe = /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/;
        legacy = legacy.filter((r) => postRe.test(r));
        current = current.filter((r) => postRe.test(r));
    }

    // M0 shell: dist may only have `/` — treat empty dist as hard fail unless self-test.
    if (!fs.existsSync(distPath)) {
        console.error(`error: dist not found: ${distPath}`);
        process.exit(1);
    }

    const { missing, extra, ok } = diffRoutes(legacy, current);
    console.log(`[compare-routes] scope=${args.scope} legacy=${legacy.length} dist=${current.length}`);
    if (missing.length) {
        console.error("MISSING in dist:");
        for (const r of missing) console.error(`  - ${r}`);
    }
    if (extra.length) {
        console.error("EXTRA in dist:");
        for (const r of extra) console.error(`  + ${r}`);
    }
    if (!ok) {
        process.exit(1);
    }
    console.log("[compare-routes] OK (no diff)");
    process.exit(0);
}

const isDirect =
    process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
    main();
}
