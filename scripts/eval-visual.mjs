/**
 * L6 visual consistency: screenshot Jekyll baseline vs Astro dist (desktop + mobile).
 *
 * Requires: npm i -D playwright && npx playwright install chromium
 * (not part of required CI; required for release checklist)
 *
 * Usage:
 *   node scripts/eval-visual.mjs
 *   node scripts/eval-visual.mjs --legacy mig/baselines/jekyll-site --dist dist
 *   node scripts/eval-visual.mjs --threshold 0.02
 *
 * Writes:
 *   mig/fixtures/visual/{baseline,current,diff}/...
 *   mig/reports/visual-latest.{json,md}
 *
 * Exit 0 if all pages under threshold; 1 otherwise.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "./eval-visual-png.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const PAGES = [
    { id: "home", path: "/" },
    { id: "page2", path: "/page2/" },
    { id: "archive", path: "/archive/" },
    { id: "about", path: "/about/" },
    { id: "post-2016", path: "/2016/03/22/hello-github-io/" },
    { id: "post-pdf", path: "/2016/08/08/rubiksrevenge/" },
    { id: "post-2023", path: "/2023/09/13/unpack-webpack-by-chatgpt/" },
    // 404: Jekyll injects body classes via inline script — need JS on for fair layout.
    // Particle canvas is masked via CSS before shot.
    { id: "404", path: "/404.html", js: true, mask: "canvas" },
    { id: "tcupdate", path: "/tcupdate.html" },
];

const VIEWPORTS = [
    { id: "desktop", width: 1440, height: 900 },
    { id: "mobile", width: 390, height: 844 },
];

function parseArgs(argv) {
    const out = {
        legacy: "mig/baselines/jekyll-site",
        dist: "dist",
        out: "mig/fixtures/visual",
        reportDir: "mig/reports",
        // Layout gate defaults to JS off (stable). Mobile gets looser threshold (font reflow).
        threshold: 0.06,
        thresholdMobile: 0.14,
        portLegacy: 4331,
        portDist: 4332,
        js: false,
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--legacy") out.legacy = argv[++i];
        else if (a === "--dist") out.dist = argv[++i];
        else if (a === "--out") out.out = argv[++i];
        else if (a === "--threshold") out.threshold = Number(argv[++i]);
        else if (a === "--js") out.js = true;
        else if (a === "--help" || a === "-h") out.help = true;
    }
    return out;
}

function resolve(p) {
    return path.isAbsolute(p) ? p : path.join(root, p);
}

function startStaticServer(dir, port) {
    const abs = path.resolve(dir);
    const server = http.createServer((req, res) => {
        try {
            let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
            if (urlPath.endsWith("/")) urlPath += "index.html";
            let filePath = path.join(abs, urlPath);
            if (!filePath.startsWith(abs)) {
                res.writeHead(403);
                res.end("Forbidden");
                return;
            }
            if (!fs.existsSync(filePath)) {
                res.writeHead(404);
                res.end("Not found");
                return;
            }
            if (fs.statSync(filePath).isDirectory()) {
                filePath = path.join(filePath, "index.html");
                if (!fs.existsSync(filePath)) {
                    res.writeHead(404);
                    res.end("Not found");
                    return;
                }
            }
            const ext = path.extname(filePath).toLowerCase();
            const types = {
                ".html": "text/html; charset=utf-8",
                ".css": "text/css",
                ".js": "text/javascript",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".svg": "image/svg+xml",
                ".woff2": "font/woff2",
                ".json": "application/json",
                ".xml": "application/xml",
                ".pdf": "application/pdf",
                ".ico": "image/x-icon",
            };
            res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
            fs.createReadStream(filePath).pipe(res);
        } catch (e) {
            res.writeHead(500);
            res.end(String(e));
        }
    });
    return new Promise((resolvePromise, reject) => {
        server.once("error", reject);
        server.listen(port, "127.0.0.1", () => resolvePromise(server));
    });
}

function pixelDiffRatio(pngA, pngB) {
    const { width, height } = pngA;
    if (pngB.width !== width || pngB.height !== height) {
        return { ratio: 1, mismatched: width * height, total: width * height, sizeMismatch: true };
    }
    const total = width * height;
    let mismatched = 0;
    const diff = new PNG({ width, height });
    for (let i = 0; i < total; i++) {
        const o = i * 4;
        const dr = Math.abs(pngA.data[o] - pngB.data[o]);
        const dg = Math.abs(pngA.data[o + 1] - pngB.data[o + 1]);
        const db = Math.abs(pngA.data[o + 2] - pngB.data[o + 2]);
        // ignore alpha; treat near-equal as match (font AA)
        const delta = dr + dg + db;
        if (delta > 30) {
            mismatched++;
            diff.data[o] = 255;
            diff.data[o + 1] = 0;
            diff.data[o + 2] = 0;
            diff.data[o + 3] = 255;
        } else {
            // dim baseline
            diff.data[o] = pngA.data[o];
            diff.data[o + 1] = pngA.data[o + 1];
            diff.data[o + 2] = pngA.data[o + 2];
            diff.data[o + 3] = 80;
        }
    }
    return { ratio: mismatched / total, mismatched, total, diff };
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        console.log(
            "Usage: node scripts/eval-visual.mjs [--legacy dir] [--dist dir] [--threshold 0.04]"
        );
        process.exit(0);
    }

    let playwright;
    try {
        playwright = await import("playwright");
    } catch {
        console.error(
            "error: playwright not installed.\n" +
                "  npm i -D playwright\n" +
                "  npx playwright install chromium"
        );
        process.exit(1);
    }

    const legacyDir = resolve(args.legacy);
    const distDir = resolve(args.dist);
    const outRoot = resolve(args.out);
    const reportDir = resolve(args.reportDir);

    if (!fs.existsSync(legacyDir)) {
        console.error(`error: baseline missing: ${legacyDir}`);
        process.exit(1);
    }
    if (!fs.existsSync(distDir)) {
        console.error(`error: dist missing: ${distDir}`);
        process.exit(1);
    }

    for (const sub of ["baseline", "current", "diff"]) {
        fs.mkdirSync(path.join(outRoot, sub), { recursive: true });
    }
    fs.mkdirSync(reportDir, { recursive: true });

    const srvL = await startStaticServer(legacyDir, args.portLegacy);
    const srvD = await startStaticServer(distDir, args.portDist);

    const browser = await playwright.chromium.launch({ headless: true });
    const results = [];
    let failed = 0;

    try {
        for (const vp of VIEWPORTS) {
            for (const page of PAGES) {
                const name = `${page.id}__${vp.id}`;
                const file = `${name}.png`;
                const basePath = path.join(outRoot, "baseline", file);
                const curPath = path.join(outRoot, "current", file);
                const diffPath = path.join(outRoot, "diff", file);

                const useJs = page.js === true || args.js === true;
                const thr = vp.id === "mobile" ? args.thresholdMobile : args.threshold;
                const ctxOpts = {
                    viewport: { width: vp.width, height: vp.height },
                    deviceScaleFactor: 1,
                    javaScriptEnabled: useJs,
                };
                const ctxL = await browser.newContext(ctxOpts);
                const ctxD = await browser.newContext(ctxOpts);
                const pL = await ctxL.newPage();
                const pD = await ctxD.newPage();

                // 404: block particle JS only (keep page404 CSS so container/inner_bck match)
                if (page.id === "404") {
                    const block = (pg) =>
                        pg.route("**/*", (route) => {
                            const u = route.request().url();
                            const isCss = /\.css(\?|$)/i.test(u);
                            if (isCss) return route.continue();
                            if (
                                /three\.js|page404|particle404|dat\.gui|stats/i.test(
                                    u
                                )
                            ) {
                                return route.abort();
                            }
                            return route.continue();
                        });
                    await block(pL);
                    await block(pD);
                }

                const urlL = `http://127.0.0.1:${args.portLegacy}${page.path}`;
                const urlD = `http://127.0.0.1:${args.portDist}${page.path}`;

                await pL.goto(urlL, { waitUntil: "load", timeout: 30000 });
                await pD.goto(urlD, { waitUntil: "load", timeout: 30000 });
                if (useJs || page.id === "404") {
                    const prep = async (pg) => {
                        await pg.evaluate(() => {
                            document.body?.classList.add(
                                "page-fullscreen",
                                "page",
                                "page-404"
                            );
                            document
                                .querySelectorAll("#container .fallback")
                                .forEach((el) => {
                                    el.style.display = "";
                                    el.style.visibility = "visible";
                                });
                            document.querySelectorAll("canvas").forEach((el) => {
                                el.style.display = "none";
                            });
                            // Normalize 404 plate art: Jekyll Vite may point at missing
                            // /media/inner_bck.*; Astro uses /_astro/hash. Use stable public path.
                            document.querySelectorAll("#container").forEach((el) => {
                                el.style.backgroundImage =
                                    "url(/img/404/inner_bck.jpg)";
                                el.style.backgroundSize = "cover";
                                el.style.backgroundPosition = "50% 0";
                            });
                        });
                    };
                    await prep(pL).catch(() => {});
                    await prep(pD).catch(() => {});
                    await pL.waitForTimeout(300);
                    await pD.waitForTimeout(300);
                }
                // Fonts + paint settle
                if (useJs) {
                    await Promise.all([
                        pL.evaluate(() => (document.fonts ? document.fonts.ready : null)),
                        pD.evaluate(() => (document.fonts ? document.fonts.ready : null)),
                    ]).catch(() => {});
                }
                await pL.waitForTimeout(250);
                await pD.waitForTimeout(250);

                await pL.screenshot({ path: basePath, fullPage: false });
                await pD.screenshot({ path: curPath, fullPage: false });

                await ctxL.close();
                await ctxD.close();

                const pngA = PNG.readFile(basePath);
                const pngB = PNG.readFile(curPath);
                const { ratio, mismatched, total, sizeMismatch, diff } = pixelDiffRatio(pngA, pngB);
                if (diff) PNG.writeFile(diffPath, diff);

                const ok = !sizeMismatch && ratio <= thr;
                if (!ok) failed++;
                results.push({
                    id: name,
                    path: page.path,
                    viewport: vp.id,
                    ratio: Number(ratio.toFixed(6)),
                    mismatched,
                    total,
                    sizeMismatch: !!sizeMismatch,
                    threshold: thr,
                    ok,
                    files: {
                        baseline: path.relative(root, basePath),
                        current: path.relative(root, curPath),
                        diff: path.relative(root, diffPath),
                    },
                });
                console.log(
                    `${ok ? "OK" : "FAIL"} ${name} ratio=${(ratio * 100).toFixed(2)}%` +
                        (sizeMismatch ? " (size mismatch)" : "")
                );
            }
        }
    } finally {
        await browser.close();
        await new Promise((r) => srvL.close(() => r()));
        await new Promise((r) => srvD.close(() => r()));
    }

    const summary = failed === 0 ? "PASS" : "FAIL";
    const report = {
        generatedAt: new Date().toISOString(),
        summary,
        threshold: args.threshold,
        failed,
        total: results.length,
        results,
    };
    const jsonPath = path.join(reportDir, "visual-latest.json");
    const mdPath = path.join(reportDir, "visual-latest.md");
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n");

    const lines = [
        `# Visual consistency ${report.generatedAt.slice(0, 10)}`,
        "",
        `- Summary: **${summary}** (${results.length - failed}/${results.length} under threshold ${args.threshold})`,
        `- Baseline server: Jekyll tree`,
        `- Current server: Astro dist`,
        "",
        "| Page | Viewport | Diff % | Status |",
        "|------|----------|--------|--------|",
        ...results.map(
            (r) =>
                `| ${r.id} | ${r.viewport} | ${(r.ratio * 100).toFixed(2)}% | ${r.ok ? "OK" : "FAIL"} |`
        ),
        "",
        "Artifacts under `mig/fixtures/visual/{baseline,current,diff}/` (gitignored).",
        "",
    ];
    fs.writeFileSync(mdPath, lines.join("\n"));
    console.log(`[eval-visual] ${summary} → ${path.relative(root, mdPath)}`);
    process.exit(failed ? 1 : 0);
}

const isDirect =
    process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
    main().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
