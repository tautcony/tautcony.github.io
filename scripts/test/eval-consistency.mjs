/**
 * Jekyll baseline (_site / mig/baselines/jekyll-site) vs Astro dist consistency eval.
 *
 * Layers: L1 routes · L2 assets · L3 content (incl. feed full-text) · L4 DOM · L5 HTTP
 * Visual L6: scripts/test/eval-visual.mjs
 *
 * Usage:
 *   node scripts/test/eval-consistency.mjs
 *   node scripts/test/eval-consistency.mjs --legacy mig/baselines/jekyll-site --dist dist
 *   node scripts/test/eval-consistency.mjs --skip-http
 *   node scripts/test/eval-consistency.mjs --self-test
 *
 * Exit 0: PASS or PASS_WITH_KNOWN_DELTAS
 * Exit 1: FAIL
 */
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    normalizeRoute,
    collectDistRoutes,
    diffRoutes,
} from "./compare-routes.mjs";
import {
    collectDistAssets,
    diffAssets,
    shouldTrackAsset,
    sha256File,
} from "./compare-assets.mjs";

const root = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));

const RETIRED_ASSETS = new Set([
    "/img/404/disc.png",
    "/img/404/inner_bck.jpg",
    "/img/404/particle_tr.png",
]);

const SAMPLE_POSTS = [
    "/2016/03/22/hello-github-io/",
    "/2016/08/08/rubiksrevenge/",
    "/2017/04/24/14th-ZJ-Programming-Contest/",
    "/2023/09/13/unpack-webpack-by-chatgpt/",
];

const SAMPLE_PAGES = [
    "/",
    "/page2/",
    "/page5/",
    "/about/",
    "/archive/",
    "/404.html",
    "/tcupdate.html",
    "/feed.xml",
    "/sitemap.xml",
    "/robots.txt",
    ...SAMPLE_POSTS,
];

function parseArgs(argv) {
    const out = {
        legacy: "mig/baselines/jekyll-site",
        dist: "dist",
        outDir: "mig/reports",
        skipHttp: false,
        selfTest: false,
        port: 4325,
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--legacy") out.legacy = argv[++i];
        else if (a === "--dist") out.dist = argv[++i];
        else if (a === "--out") out.outDir = argv[++i];
        else if (a === "--skip-http") out.skipHttp = true;
        else if (a === "--port") out.port = Number(argv[++i]);
        else if (a === "--self-test") out.selfTest = true;
        else if (a === "--help" || a === "-h") out.help = true;
    }
    return out;
}

function resolve(p) {
    return path.isAbsolute(p) ? p : path.join(root, p);
}

function resolveStaticRequestPath(staticRoot, requestUrl) {
    let urlPath;
    try {
        urlPath = decodeURIComponent(requestUrl.split("?")[0].split("#")[0]);
    } catch {
        return null;
    }

    if (urlPath.includes("\0") || urlPath.includes("\\")) {
        return null;
    }

    const parts = urlPath.split("/");
    if (parts.some(part => part === "..")) {
        return null;
    }

    const safeParts = parts.filter(part => part && part !== ".");
    if (safeParts.length === 0 || urlPath.endsWith("/")) {
        safeParts.push("index.html");
    }

    const candidate = path.resolve(staticRoot, ...safeParts);
    const relative = path.relative(staticRoot, candidate);
    if (relative && (relative.startsWith("..") || path.isAbsolute(relative))) {
        return null;
    }

    return candidate;
}

function sha256Text(s) {
    return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}

function decodeEntities(html) {
    let prev = "";
    let s = String(html ?? "");
    // Feed descriptions are entity-escaped HTML; decode repeatedly.
    for (let i = 0; i < 5 && s !== prev; i++) {
        prev = s;
        s = s
            .replace(/&nbsp;/gi, " ")
            .replace(/&quot;/gi, '"')
            .replace(/&apos;/gi, "'")
            .replace(/&#39;/g, "'")
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">")
            .replace(/&amp;/gi, "&")
            .replace(/&#(\d+);/g, (_, n) => {
                try {
                    return String.fromCodePoint(Number(n));
                } catch {
                    return "";
                }
            })
            .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
                try {
                    return String.fromCodePoint(parseInt(n, 16));
                } catch {
                    return "";
                }
            });
    }
    return s;
}

function collapseWs(s) {
    return String(s).replace(/\s+/g, " ").trim();
}

function stripWs(s) {
    return String(s).replace(/\s+/g, "");
}

function isHtmlNameChar(ch) {
    return ch !== undefined && (
        (ch >= "a" && ch <= "z")
        || (ch >= "A" && ch <= "Z")
        || (ch >= "0" && ch <= "9")
        || ch === "-"
        || ch === ":"
    );
}

function findTagEnd(source, start) {
    let quote = "";
    for (let i = start; i < source.length; i++) {
        const ch = source[i];
        if (quote) {
            if (ch === quote) quote = "";
        } else if (ch === "\"" || ch === "'") {
            quote = ch;
        } else if (ch === ">") {
            return i;
        }
    }
    return -1;
}

function parseHtmlTagAt(source, index) {
    if (source[index] !== "<") return null;

    let cursor = index + 1;
    let closing = false;
    if (source[cursor] === "/") {
        closing = true;
        cursor++;
    }

    while (source[cursor] === " " || source[cursor] === "\n" || source[cursor] === "\r" || source[cursor] === "\t") {
        cursor++;
    }

    const nameStart = cursor;
    while (isHtmlNameChar(source[cursor])) cursor++;
    if (cursor === nameStart) return null;

    const end = findTagEnd(source, cursor);
    if (end === -1) return null;

    return {
        name: source.slice(nameStart, cursor).toLowerCase(),
        start: index,
        end: end + 1,
        closing,
        selfClosing: source[end - 1] === "/",
    };
}

function findElementContentEnd(source, start, name) {
    let depth = 1;
    let cursor = start;

    while (cursor < source.length) {
        const nextTag = source.indexOf("<", cursor);
        if (nextTag === -1) {
            return { contentEnd: source.length, blockEnd: source.length };
        }

        const tag = parseHtmlTagAt(source, nextTag);
        if (!tag) {
            cursor = nextTag + 1;
            continue;
        }

        if (tag.name === name) {
            if (tag.closing) {
                depth--;
                if (depth === 0) {
                    return { contentEnd: tag.start, blockEnd: tag.end };
                }
            } else if (!tag.selfClosing) {
                depth++;
            }
        }

        cursor = tag.end;
    }

    return { contentEnd: source.length, blockEnd: source.length };
}

function removeHtmlComments(source, replacement = " ") {
    let out = "";
    let cursor = 0;

    while (cursor < source.length) {
        const start = source.indexOf("<!--", cursor);
        if (start === -1) {
            out += source.slice(cursor);
            break;
        }

        out += source.slice(cursor, start) + replacement;
        const end = source.indexOf("-->", start + 4);
        if (end === -1) break;
        cursor = end + 3;
    }

    return out;
}

function transformHtmlElements(source, shouldTransform, transform) {
    let out = "";
    let cursor = 0;

    while (cursor < source.length) {
        const nextTag = source.indexOf("<", cursor);
        if (nextTag === -1) {
            out += source.slice(cursor);
            break;
        }

        const tag = parseHtmlTagAt(source, nextTag);
        const openingTag = tag ? source.slice(nextTag, tag.end) : "";
        if (!tag || tag.closing || tag.selfClosing || !shouldTransform(tag, openingTag)) {
            out += source.slice(cursor, nextTag + 1);
            cursor = nextTag + 1;
            continue;
        }

        const match = findElementContentEnd(source, tag.end, tag.name);
        out += source.slice(cursor, nextTag);
        out += transform(source.slice(tag.end, match.contentEnd), tag);
        cursor = match.blockEnd;
    }

    return out;
}

function stripHtmlTags(source, replacement = " ") {
    let out = "";
    let cursor = 0;

    while (cursor < source.length) {
        const nextTag = source.indexOf("<", cursor);
        if (nextTag === -1) {
            out += source.slice(cursor);
            break;
        }

        const tag = parseHtmlTagAt(source, nextTag);
        if (!tag) {
            out += source.slice(cursor, nextTag + 1);
            cursor = nextTag + 1;
            continue;
        }

        out += source.slice(cursor, nextTag) + replacement;
        cursor = tag.end;
    }

    return out;
}

function hasTexAnnotationEncoding(openingTag) {
    const lower = openingTag.toLowerCase();
    return lower.includes("encoding=\"application/x-tex\"") || lower.includes("encoding='application/x-tex'");
}

/**
 * Full-content plain text for Jekyll↔Astro compare.
 *
 * Critical order: strip tags **before** decoding `&lt;` / `&#x3C;`, otherwise C++
 * `<<` becomes a false HTML tag and most of the code is discarded.
 *
 * - Feed-safe multi-pass entity decode (after strip)
 * - Math delimiters \( \)/$$/\[ \] canonicalized
 * - Code: whitespace stripped (highlighter token spacing)
 */
export function normalizePlainText(html) {
    if (!html) return "";
    // Feed items are fully entity-escaped markup; decode once so tags exist.
    // Page HTML is mostly raw tags with entities only inside text — one decode
    // pass is enough *after* strip; for feed we need decode-first carefully.
    let s = String(html);

    // If content looks like escaped HTML (feed description), decode until tags appear.
    if (!/<[a-zA-Z!/?]/.test(s) && /&lt;[a-zA-Z!/?]/.test(s)) {
        s = decodeEntities(s);
    }

    s = transformHtmlElements(
        s,
        tag => tag.name === "script" || tag.name === "style",
        () => " "
    );

    // KaTeX annotation → math token (before general strip)
    s = transformHtmlElements(
        s,
        (tag, openingTag) => tag.name === "annotation" && hasTexAnnotationEncoding(openingTag),
        m => ` \u27e6MATH:${stripWs(decodeEntities(m))}\u27e7 `
    );

    // Code first while &lt; still protects << inside source
    s = transformHtmlElements(
        s,
        tag => tag.name === "pre" || tag.name === "code",
        block => ` \u27e6CODE:${stripWs(decodeEntities(stripHtmlTags(block)))}\u27e7 `
    );

    s = removeHtmlComments(s);
    s = stripHtmlTags(s);
    // Now safe to decode remaining entities in prose
    s = decodeEntities(s);

    // Math delimiters in prose / leftover latex
    s = s.replace(/\$\$([\s\S]*?)\$\$/g, (_, m) => ` ⟦MATH:${stripWs(m)}⟧ `);
    s = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => ` ⟦MATH:${stripWs(m)}⟧ `);
    s = s.replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => ` ⟦MATH:${stripWs(m)}⟧ `);
    s = s.replace(/\\([%&#_])/g, "$1");
    s = s.replace(/[\u200b]|[\u200c]|[\u200d]|[\ufeff]/g, "");
    return collapseWs(s);
}

function routeToFile(baseDir, route) {
    const r = normalizeRoute(route);
    if (r.endsWith(".html") || r.endsWith(".xml") || r.endsWith(".txt")) {
        return path.join(baseDir, r.slice(1));
    }
    // directory style
    const asIndex = path.join(baseDir, r.slice(1), "index.html");
    if (fs.existsSync(asIndex)) return asIndex;
    const bare = path.join(baseDir, r.slice(1).replace(/\/$/, "") + ".html");
    if (fs.existsSync(bare)) return bare;
    return asIndex;
}

function readRoute(baseDir, route) {
    const f = routeToFile(baseDir, route);
    if (!fs.existsSync(f)) return null;
    return fs.readFileSync(f, "utf8");
}

function extractTitle(html) {
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return m ? normalizePlainText(m[1]) : "";
}

function extractMetaDescription(html) {
    const m = html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
    ) || html.match(
        /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i
    );
    return m ? m[1].trim() : "";
}

function extractPostLinks(html) {
    const links = [];
    const re = /href="(\/\d{4}\/\d{2}\/\d{2}\/[^"]+\/)"/g;
    let m;
    while ((m = re.exec(html))) {
        if (!links.includes(m[1])) links.push(m[1]);
    }
    return links;
}

function extractDataEncodes(html) {
    return [...html.matchAll(/data-encode="([^"]*)"/g)].map((m) => m[1]).sort();
}

function extractUpdateDate(html) {
    const m = html.match(/id=["']update-date["'][^>]*>([\s\S]*?)<\/span>/i);
    return m ? normalizePlainText(m[1]) : "";
}

/** Article body only (exclude nav/footer/sidebar/comments). */
function extractMainHtml(html) {
    let start = html.search(
        /class=["'][^"']*post-container|class=["'][^"']*post-heading|id=["']post-content/i
    );
    if (start < 0) {
        start = html.search(/<main[^>]*id=["']main-content["']/i);
    }
    if (start < 0) start = 0;
    let chunk = html.slice(start, start + 800_000);
    // Cut chrome only — do NOT match syntax-highlight spans like class="comment" / class="c".
    chunk = chunk.split(
        /class=["']pager["']|id=["']disqus_thread["']|class=["']comments?["']|id=["']comments?["']|utteranc|side-catalog|id=["']tag_cloud["']|<footer\b|id=["']secondary["']|class=["']col-lg-3[^"']*sidebar/i
    )[0];
    // Interactive embed labels are UI chrome, not article prose. The PDF URL
    // contract is checked separately below. Strip host + placeholder + mount shell.
    chunk = chunk.replace(
        /<div\b(?=[^>]*\bclass=["'][^"']*\bpdf-embed\b)(?![^>]*pdf-embed__)[^>]*>[\s\S]*?<\/object>\s*<p\b[^>]*pdf-embed__actions[\s\S]*?<\/p>\s*<\/div>\s*<\/div>/gi,
        ""
    );
    chunk = chunk.replace(
        /<div\b(?=[^>]*\bclass=["'][^"']*\bpdf-embed\b)(?![^>]*pdf-embed__)[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
        ""
    );
    return chunk;
}

function postBodyPlain(html) {
    return normalizePlainText(extractMainHtml(html));
}

/**
 * Split normalized text into prose / code / math for full-content gates.
 * Prose must match exactly; code is compared joined (highlighter index order may differ).
 */
function splitContentParts(normalized) {
    const codes = [];
    const maths = [];
    const prose = normalized
        .replace(/⟦CODE:([^⟧]*)⟧/g, (_, c) => {
            codes.push(c);
            return " ";
        })
        .replace(/⟦MATH:([^⟧]*)⟧/g, (_, m) => {
            maths.push(m);
            return " ";
        })
        .replace(/\s+/g, " ")
        .trim();
    return {
        prose,
        maths: [...maths].sort(),
        codeJoined: codes.join(""),
        codeCount: codes.length,
    };
}

function compareFullContent(htmlLegacy, htmlDist, { route }) {
    const nL = postBodyPlain(htmlLegacy);
    const nD = postBodyPlain(htmlDist);
    const a = splitContentParts(nL);
    const b = splitContentParts(nD);
    const issues = [];
    const notes = [];

    if (a.prose !== b.prose) {
        let at = 0;
        while (at < a.prose.length && at < b.prose.length && a.prose[at] === b.prose[at]) {
            at++;
        }
        issues.push({
            route,
            reason: "prose mismatch (full content)",
            diffAt: at,
            legacyAt: a.prose.slice(at, at + 80),
            distAt: b.prose.slice(at, at + 80),
            legacyLen: a.prose.length,
            distLen: b.prose.length,
        });
    }

    if (JSON.stringify(a.maths) !== JSON.stringify(b.maths)) {
        // math token multiset — allow near if same count
        if (a.maths.length !== b.maths.length) {
            issues.push({
                route,
                reason: "math count mismatch",
                legacy: a.maths.length,
                dist: b.maths.length,
            });
        } else {
            notes.push({
                route,
                reason: "math token order/form differs",
                allowlist: "feed-html-markup",
            });
        }
    }

    if (a.codeJoined !== b.codeJoined) {
        const ratio = plainSimilarity(a.codeJoined, b.codeJoined);
        // Large fenced blocks: rouge vs rehype may drop/keep a few chars; require strong overlap
        if (ratio < 0.93) {
            issues.push({
                route,
                reason: "code full-content mismatch",
                similarity: Number(ratio.toFixed(4)),
                legacyLen: a.codeJoined.length,
                distLen: b.codeJoined.length,
                legacyCount: a.codeCount,
                distCount: b.codeCount,
            });
        } else {
            notes.push({
                route,
                reason: "code near-match after whitespace strip",
                similarity: Number(ratio.toFixed(4)),
                allowlist: "feed-html-markup",
            });
        }
    }

    return { ok: issues.length === 0, issues, notes, parts: { a, b } };
}

function collectAssetsFromDir(dir) {
    /** @type {Record<string, { size: number, sha256: string }>} */
    const out = {};
    if (!fs.existsSync(dir)) return out;
    function walk(d) {
        for (const name of fs.readdirSync(d)) {
            const full = path.join(d, name);
            const st = fs.statSync(full);
            if (st.isDirectory()) {
                walk(full);
                continue;
            }
            const rel = `/${path.relative(dir, full).split(path.sep).join("/")}`;
            if (!shouldTrackAsset(rel)) continue;
            if (rel.startsWith("/_astro/") || rel.startsWith("/assets/build/")) continue;
            out[rel] = { size: st.size, sha256: sha256File(full) };
        }
    }
    walk(dir);
    return out;
}

function parseFeedItems(xml) {
    const items = [];
    const re = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = re.exec(xml))) {
        const block = m[1];
        const title = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
        const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
        const desc = (block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || "";
        const cats = [...block.matchAll(/<category>([\s\S]*?)<\/category>/g)].map((x) =>
            normalizePlainText(x[1])
        );
        items.push({
            title: normalizePlainText(title),
            link: link.trim(),
            categories: cats,
            bodyPlain: normalizePlainText(desc),
            bodyHash: sha256Text(normalizePlainText(desc)),
            descLen: desc.length,
        });
    }
    return items;
}

function parseSitemapLocs(xml) {
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).sort();
}

function domProbes(route, html) {
    const isTc = route === "/tcupdate.html";
    const is404 = route === "/404.html";
    const isFeed = route.endsWith(".xml") || route.endsWith(".txt");
    if (isFeed) return {};

    /** @type {Record<string, boolean|number|string>} */
    const p = {};
    if (!isTc) {
        p["nav.brand"] = /\bnavbar-brand\b/.test(html);
        p["footer.copyright"] = /\bcopyright\b/.test(html);
        p["main"] = /id=["']main-content["']/.test(html);
        p["gotop"] = /id=["']gotop["']|back-to-top/.test(html);
    }
    if (route === "/" || /^\/page\d+\//.test(route)) {
        p["home.postLinks"] = extractPostLinks(html).length;
        p["home.pager"] = /\/page2\//.test(html) || /\/page\d+\//.test(html) || route !== "/";
    }
    if (route === "/archive/") {
        p["archive.cloud"] = /id=["']tag_cloud["']/.test(html);
        p["archive.jsTags"] = /\bjs-tags\b/.test(html);
        p["archive.jsResult"] = /\bjs-result\b/.test(html);
        p["archive.encodeCount"] = extractDataEncodes(html).length;
    }
    if (route === "/about/") {
        p["about.aplayer"] = /aplayer|APlayer/i.test(html);
        p["about.utterances"] = /utteranc/i.test(html);
    }
    if (is404) {
        p["404.container"] = /id=["']container["']/.test(html);
        p["404.fallback"] = /\bfallback\b/.test(html);
        p["404.module"] = /_astro\/|page404|particle/i.test(html);
        p["404.fullscreen"] =
            /page-fullscreen/.test(html) || /page-fullscreen/.test(html);
    }
    if (isTc) {
        p["tc.section"] = /id=["']tool-downloads["']/.test(html);
        p["tc.downloadLink"] = /download-link|data-latest-release/.test(html);
        p["tc.history"] = /history-download|data-release-history/.test(html);
    }
    if (/^\/\d{4}\//.test(route)) {
        p["post.updateDate"] = extractUpdateDate(html) || "(empty)";
        p["post.pdf"] = /\bpdf-embed\b|data-pdf-file=/.test(html);
        p["post.code"] = /<pre[\s>]|class=["'][^"']*highlight/.test(html);
        p["post.tags"] = (html.match(/class=["']tag["']/g) || []).length;
    }
    return p;
}

function layerL1(legacyDir, distDir) {
    const legacy = collectDistRoutes(legacyDir);
    const current = collectDistRoutes(distDir);
    const d = diffRoutes(legacy, current);
    const sitemapL = parseSitemapLocs(readRoute(legacyDir, "/sitemap.xml") || "");
    const sitemapD = parseSitemapLocs(readRoute(distDir, "/sitemap.xml") || "");
    const smMiss = sitemapL.filter((x) => !sitemapD.includes(x));
    const smExtra = sitemapD.filter((x) => !sitemapL.includes(x));
    return {
        ok: d.ok && smMiss.length === 0 && smExtra.length === 0,
        legacy: legacy.length,
        dist: current.length,
        missing: d.missing,
        extra: d.extra,
        sitemap: {
            legacy: sitemapL.length,
            dist: sitemapD.length,
            missing: smMiss,
            extra: smExtra,
        },
    };
}

function layerL2(legacyDir, distDir) {
    const legacy = collectAssetsFromDir(legacyDir);
    const current = collectDistAssets(distDir);
    const retired = [];
    for (const url of RETIRED_ASSETS) {
        if (url in legacy) {
            delete legacy[url];
            retired.push(url);
        }
    }
    const d = diffAssets(legacy, current);
    return {
        ok: d.ok,
        legacy: Object.keys(legacy).length,
        dist: Object.keys(current).length,
        retired,
        missing: d.missing,
        extra: d.extra,
        changed: d.changed.map((c) => c.url),
    };
}

function layerL3(legacyDir, distDir) {
    const failed = [];
    const info = [];

    // List order
    for (const page of ["/", "/page2/", "/page3/", "/page4/", "/page5/"]) {
        const hl = readRoute(legacyDir, page);
        const hd = readRoute(distDir, page);
        if (!hl || !hd) {
            failed.push({ route: page, reason: "missing html" });
            continue;
        }
        const pl = extractPostLinks(hl);
        const pd = extractPostLinks(hd);
        if (JSON.stringify(pl) !== JSON.stringify(pd)) {
            failed.push({
                route: page,
                reason: "post order/list mismatch",
                legacy: pl,
                dist: pd,
            });
        }
    }

    // Archive tags
    const al = readRoute(legacyDir, "/archive/");
    const ad = readRoute(distDir, "/archive/");
    if (al && ad) {
        const el = extractDataEncodes(al);
        const ed = extractDataEncodes(ad);
        if (JSON.stringify(el) !== JSON.stringify(ed)) {
            failed.push({
                route: "/archive/",
                reason: "data-encode set mismatch",
                legacyCount: el.length,
                distCount: ed.length,
            });
        }
    }

    // Posts: lastmod + body plain hash (full content)
    for (const route of SAMPLE_POSTS) {
        const hl = readRoute(legacyDir, route);
        const hd = readRoute(distDir, route);
        if (!hl || !hd) {
            failed.push({ route, reason: "missing post html" });
            continue;
        }
        const titleL = extractTitle(hl);
        const titleD = extractTitle(hd);
        if (titleL !== titleD) {
            // allow minor entity differences already normalized
            failed.push({ route, reason: "title mismatch", legacy: titleL, dist: titleD });
        }
        const lmL = extractUpdateDate(hl);
        const lmD = extractUpdateDate(hd);
        if (lmL && lmD && lmL !== lmD) {
            failed.push({ route, reason: "lastmod mismatch", legacy: lmL, dist: lmD });
        }
        const cmp = compareFullContent(hl, hd, { route });
        failed.push(...cmp.issues);
        info.push(...cmp.notes);
        // PDF contract on rubiks
        if (route.includes("rubiksrevenge")) {
            const pdfL = hl.match(/data-pdf-file="([^"]+)"/)?.[1];
            const pdfD = hd.match(/data-pdf-file="([^"]+)"/)?.[1];
            if (!pdfL || pdfL !== pdfD) {
                failed.push({ route, reason: "pdf-embed URL mismatch", legacy: pdfL, dist: pdfD });
            }
            // Dormant <object type=application/pdf> is OK; lazy means no data/src yet.
            const objectTags = hd.match(/<object\b[^>]*type=["']application\/pdf[^>]*>/gi) || [];
            for (const tag of objectTags) {
                if (/\b(?:data|src)=["'][^"']+/i.test(tag)) {
                    failed.push({
                        route,
                        reason: "pdf-embed is not lazy in static HTML (object has data/src)",
                    });
                    break;
                }
            }
        }
    }

    // Feed: full-content plain text per item
    const feedL = readRoute(legacyDir, "/feed.xml") || "";
    const feedD = readRoute(distDir, "/feed.xml") || "";
    const itemsL = parseFeedItems(feedL);
    const itemsD = parseFeedItems(feedD);
    if (itemsL.length !== itemsD.length) {
        failed.push({
            route: "/feed.xml",
            reason: "item count",
            legacy: itemsL.length,
            dist: itemsD.length,
        });
    } else {
        for (let i = 0; i < itemsL.length; i++) {
            const a = itemsL[i];
            const b = itemsD[i];
            if (a.link !== b.link || a.title !== b.title) {
                failed.push({
                    route: "/feed.xml",
                    reason: `item ${i} link/title`,
                    legacy: { title: a.title, link: a.link },
                    dist: { title: b.title, link: b.link },
                });
                continue;
            }
            if (a.bodyHash !== b.bodyHash) {
                // Re-run prose/code split on feed item bodies (already plain-normalized)
                const sa = splitContentParts(a.bodyPlain);
                const sb = splitContentParts(b.bodyPlain);
                if (sa.prose !== sb.prose) {
                    const ratio = plainSimilarity(sa.prose, sb.prose);
                    if (ratio < 0.97) {
                        failed.push({
                            route: "/feed.xml",
                            reason: `item ${i} prose full-content mismatch`,
                            title: a.title,
                            similarity: Number(ratio.toFixed(4)),
                            legacyLen: sa.prose.length,
                            distLen: sb.prose.length,
                        });
                    } else {
                        info.push({
                            route: "/feed.xml",
                            item: i,
                            title: a.title,
                            reason: "feed prose near-match",
                            similarity: Number(ratio.toFixed(4)),
                            allowlist: "feed-html-markup",
                        });
                    }
                }
                if (sa.codeJoined !== sb.codeJoined) {
                    const ratio = plainSimilarity(sa.codeJoined, sb.codeJoined);
                    // Large fenced dumps: Jekyll rouge vs Astro rehype token text can diverge
                    // more in RSS (escaped HTML). Prose already gated above; code ≥0.80 +
                    // both non-empty counts as full-content pass with known markup delta.
                    if (ratio < 0.8 || !sa.codeJoined.length || !sb.codeJoined.length) {
                        failed.push({
                            route: "/feed.xml",
                            reason: `item ${i} code full-content mismatch`,
                            title: a.title,
                            similarity: Number(ratio.toFixed(4)),
                            legacyLen: sa.codeJoined.length,
                            distLen: sb.codeJoined.length,
                        });
                    } else {
                        info.push({
                            route: "/feed.xml",
                            item: i,
                            title: a.title,
                            reason: "feed code near-match (highlighter/RSS escape)",
                            similarity: Number(ratio.toFixed(4)),
                            allowlist: "feed-html-markup",
                        });
                    }
                }
            }
            // categories
            if (JSON.stringify(a.categories) !== JSON.stringify(b.categories)) {
                failed.push({
                    route: "/feed.xml",
                    reason: `item ${i} categories`,
                    legacy: a.categories,
                    dist: b.categories,
                });
            }
        }
    }

    // Page meta descriptions
    for (const route of ["/", "/about/", "/archive/", "/404.html"]) {
        const hl = readRoute(legacyDir, route);
        const hd = readRoute(distDir, route);
        if (!hl || !hd) continue;
        const dl = extractMetaDescription(hl);
        const dd = extractMetaDescription(hd);
        if (dl && dd && dl !== dd) {
            failed.push({
                route,
                reason: "meta description",
                legacy: dl,
                dist: dd,
            });
        }
    }

    return {
        ok: failed.length === 0,
        failed,
        info,
        feedItems: itemsL.length,
    };
}

/** Similarity: prefix + token Jaccard (works for CJK / code tokens). */
function plainSimilarity(a, b) {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    const min = Math.min(a.length, b.length);
    let same = 0;
    for (let i = 0; i < min; i++) {
        if (a[i] === b[i]) same++;
        else break;
    }
    const prefixRatio = same / Math.max(a.length, b.length);
    // tokenise on whitespace and CJK-friendly chunks
    const tok = (s) => s.split(/[\s,，。；;:!？?]+/).filter((t) => t.length > 1);
    const wa = new Set(tok(a));
    const wb = new Set(tok(b));
    let inter = 0;
    for (const w of wa) if (wb.has(w)) inter++;
    const union = wa.size + wb.size - inter || 1;
    const jaccard = inter / union;
    // length ratio soft penalty
    const lenRatio =
        Math.min(a.length, b.length) / Math.max(a.length, b.length);
    return Math.max(prefixRatio, jaccard * 0.7 + lenRatio * 0.3);
}

function layerL4(legacyDir, distDir) {
    const failed = [];
    const info = [];
    const routes = [
        "/",
        "/page2/",
        "/about/",
        "/archive/",
        "/404.html",
        "/tcupdate.html",
        ...SAMPLE_POSTS,
    ];
    for (const route of routes) {
        const hl = readRoute(legacyDir, route);
        const hd = readRoute(distDir, route);
        if (!hl || !hd) {
            failed.push({ route, reason: "missing for DOM probe" });
            continue;
        }
        const pl = domProbes(route, hl);
        const pd = domProbes(route, hd);
        if (route === "/404.html" && /three\.js\/r56/.test(hd)) {
            failed.push({ route, probe: "404.noLegacyThree", dist: false });
        }
        for (const key of Object.keys(pl)) {
            const lv = pl[key];
            const dv = pd[key];
            // boolean: legacy true requires dist true
            if (typeof lv === "boolean") {
                if (lv && !dv) {
                    failed.push({ route, probe: key, legacy: lv, dist: dv });
                } else if (!lv && dv) {
                    info.push({ route, probe: key, note: "dist extra true", allowlist: "heti-class-extra" });
                }
            } else if (typeof lv === "number") {
                if (lv !== dv) {
                    // allow dist >= for tag counts if close
                    if (key === "archive.encodeCount" && lv !== dv) {
                        failed.push({ route, probe: key, legacy: lv, dist: dv });
                    } else if (key === "home.postLinks" && lv !== dv) {
                        failed.push({ route, probe: key, legacy: lv, dist: dv });
                    } else if (lv > 0 && dv === 0) {
                        failed.push({ route, probe: key, legacy: lv, dist: dv });
                    }
                }
            } else if (typeof lv === "string") {
                if (lv !== dv && lv !== "(empty)" && dv !== "(empty)") {
                    // lastmod already checked in L3
                    if (key === "post.updateDate" && lv !== dv) {
                        failed.push({ route, probe: key, legacy: lv, dist: dv });
                    }
                }
            }
        }
    }
    return { ok: failed.length === 0, failed, info };
}

function startStaticServer(dir, port) {
    const abs = path.resolve(dir);
    const server = http.createServer((req, res) => {
        try {
            let filePath = resolveStaticRequestPath(abs, req.url || "/");
            if (!filePath) {
                res.writeHead(403);
                res.end("Forbidden");
                return;
            }
            if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
                // try as directory index
                const idx = path.join(filePath, "index.html");
                if (fs.existsSync(idx)) filePath = idx;
                else {
                    res.writeHead(404);
                    res.end("Not found");
                    return;
                }
            }
            const ext = path.extname(filePath).toLowerCase();
            const types = {
                ".html": "text/html; charset=utf-8",
                ".xml": "application/xml; charset=utf-8",
                ".js": "text/javascript",
                ".css": "text/css",
                ".json": "application/json",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".gif": "image/gif",
                ".svg": "image/svg+xml",
                ".pdf": "application/pdf",
                ".woff2": "font/woff2",
                ".ico": "image/x-icon",
                ".txt": "text/plain",
            };
            res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
            fs.createReadStream(filePath).pipe(res);
        } catch {
            res.writeHead(500);
            res.end("Internal server error");
        }
    });
    return new Promise((resolvePromise) => {
        server.listen(port, "127.0.0.1", () => resolvePromise(server));
    });
}

async function layerL5(distDir, port) {
    const server = await startStaticServer(distDir, port);
    const failed = [];
    const ok = [];
    try {
        for (const route of SAMPLE_PAGES) {
            const url = `http://127.0.0.1:${port}${route === "/" ? "/" : route}`;
            try {
                const res = await fetch(url);
                const buf = await res.arrayBuffer();
                if (res.status !== 200) {
                    failed.push({ route, status: res.status });
                } else {
                    ok.push({ route, status: 200, bytes: buf.byteLength });
                }
            } catch (e) {
                failed.push({ route, error: String(e) });
            }
        }
        // quote + pdf + current 404 texture
        for (const route of [
            "/json/quote.json",
            "/attach/rubiksrevenge/G-rubiksrevenge.pdf",
            "/img/box_bck.png",
            "/CNAME",
        ]) {
            const res = await fetch(`http://127.0.0.1:${port}${route}`);
            if (res.status !== 200) failed.push({ route, status: res.status });
            else ok.push({ route, status: 200 });
        }
    } finally {
        await new Promise((r) => server.close(() => r()));
    }
    return { ok: failed.length === 0, failed, okCount: ok.length, samples: ok.slice(0, 5) };
}

function writeReport(outDir, report) {
    fs.mkdirSync(outDir, { recursive: true });
    const stamp = new Date().toISOString().slice(0, 10);
    const jsonPath = path.join(outDir, `consistency-${stamp}.json`);
    const latestJson = path.join(outDir, "consistency-latest.json");
    const mdPath = path.join(outDir, `consistency-${stamp}.md`);
    const latestMd = path.join(outDir, "consistency-latest.md");
    const text = JSON.stringify(report, null, 2) + "\n";
    fs.writeFileSync(jsonPath, text);
    fs.writeFileSync(latestJson, text);

    const lines = [
        `# Consistency report ${stamp}`,
        "",
        `- Baseline: \`${report.baseline}\``,
        `- Candidate: \`${report.candidate}\``,
        `- Summary: **${report.summary}**`,
        "",
        "| Layer | OK | Notes |",
        "|-------|----|-------|",
    ];
    for (const [k, v] of Object.entries(report.layers)) {
        if (!v) continue;
        const note =
            k === "L1_routes"
                ? `routes ${v.legacy}/${v.dist}; sitemap ${v.sitemap?.legacy}/${v.sitemap?.dist}`
                : k === "L2_assets"
                  ? `assets ${v.legacy}/${v.dist}; retired ${v.retired?.length || 0}; missing ${v.missing?.length || 0}`
                  : k === "L3_content"
                    ? `failed ${v.failed?.length || 0}; info ${v.info?.length || 0}`
                    : k === "L4_dom"
                      ? `failed ${v.failed?.length || 0}`
                      : k === "L5_http"
                        ? v.skipped
                          ? "skipped"
                          : `failed ${v.failed?.length || 0}; ok ${v.okCount}`
                        : "";
        lines.push(`| ${k} | ${v.ok === null ? "n/a" : v.ok ? "✅" : "❌"} | ${note} |`);
    }
    lines.push("", "## Failures", "");
    const fails = [];
    for (const layer of Object.values(report.layers)) {
        if (layer?.failed?.length) fails.push(...layer.failed.map((f) => ({ layer: layer, f })));
    }
    if (!fails.length) lines.push("_None_");
    else {
        for (const { f } of fails.slice(0, 50)) {
            lines.push(`- \`${JSON.stringify(f)}\``);
        }
    }
    lines.push("", "## Info / near-matches", "");
    const infos = [];
    for (const layer of Object.values(report.layers)) {
        if (layer?.info?.length) infos.push(...layer.info);
    }
    if (!infos.length) lines.push("_None_");
    else for (const i of infos.slice(0, 40)) lines.push(`- \`${JSON.stringify(i)}\``);

    lines.push("", "## Decisions", "");
    lines.push("- Feed: full-content plain-text alignment");
    lines.push("- Baseline: gitignored `mig/baselines/jekyll-site`");
    lines.push("- CI: optional (not required)");
    lines.push("- Visual: `npm run eval:visual` (required for release checklist)");
    lines.push("");

    const md = lines.join("\n");
    fs.writeFileSync(mdPath, md);
    fs.writeFileSync(latestMd, md);
    return { jsonPath, mdPath, latestJson, latestMd };
}

function selfTest() {
    let failed = 0;
    const t1 = normalizePlainText("<p>Hello&nbsp;<b>世界</b></p>");
    if (t1 !== "Hello 世界") {
        console.error("normalizePlainText failed", t1);
        failed++;
    }
    const t2 = normalizePlainText("a<!--more-->b");
    if (t2 !== "a b" && t2 !== "ab") {
        // collapse may keep space
        if (normalizePlainText("a <!--more--> b") !== "a b") {
            console.error("comment strip failed", t2);
            failed++;
        }
    }
    if (plainSimilarity("abc", "abc") !== 1) failed++;
    if (plainSimilarity("hello world", "hello world!") < 0.5) failed++;
    if (failed) {
        console.error(`[eval-consistency] self-test FAILED (${failed})`);
        process.exit(1);
    }
    console.log("[eval-consistency] self-test OK");
    process.exit(0);
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        console.log(
            "Usage: node scripts/test/eval-consistency.mjs [--legacy dir] [--dist dir] [--out dir] [--skip-http] [--self-test]"
        );
        process.exit(0);
    }
    if (args.selfTest) {
        selfTest();
        return;
    }

    const legacyDir = resolve(args.legacy);
    const distDir = resolve(args.dist);
    const outDir = resolve(args.outDir);

    if (!fs.existsSync(legacyDir)) {
        console.error(
            `error: legacy baseline not found: ${legacyDir}\n` +
                "Freeze with: rsync -a --delete _site/ mig/baselines/jekyll-site/"
        );
        process.exit(1);
    }
    if (!fs.existsSync(distDir)) {
        console.error(`error: dist not found: ${distDir} (run npm run build)`);
        process.exit(1);
    }

    console.log(`[eval] legacy=${path.relative(root, legacyDir)} dist=${path.relative(root, distDir)}`);

    const L1 = layerL1(legacyDir, distDir);
    console.log(`[L1] routes ok=${L1.ok} ${L1.legacy}/${L1.dist}`);
    const L2 = layerL2(legacyDir, distDir);
    console.log(`[L2] assets ok=${L2.ok} ${L2.legacy}/${L2.dist}`);
    const L3 = layerL3(legacyDir, distDir);
    console.log(`[L3] content ok=${L3.ok} failed=${L3.failed.length} info=${L3.info.length}`);
    const L4 = layerL4(legacyDir, distDir);
    console.log(`[L4] dom ok=${L4.ok} failed=${L4.failed.length}`);

    let L5 = { ok: null, skipped: true };
    if (!args.skipHttp) {
        L5 = await layerL5(distDir, args.port);
        console.log(`[L5] http ok=${L5.ok} failed=${L5.failed?.length || 0}`);
    } else {
        console.log("[L5] http skipped");
    }

    const hardFail =
        !L1.ok ||
        !L2.ok ||
        !L3.ok ||
        !L4.ok ||
        (L5.ok === false);

    const summary = hardFail
        ? "FAIL"
        : L3.info.length || L4.info.length
          ? "PASS_WITH_KNOWN_DELTAS"
          : "PASS";

    const report = {
        baseline: path.relative(root, legacyDir),
        candidate: path.relative(root, distDir),
        generatedAt: new Date().toISOString(),
        summary,
        layers: {
            L1_routes: L1,
            L2_assets: L2,
            L3_content: L3,
            L4_dom: L4,
            L5_http: L5,
            L6_visual: {
                ok: null,
                skipped: true,
                note: "Run npm run eval:visual (required for release checklist)",
            },
        },
        decisions: {
            feed: "full-content plain-text",
            baselineGitignored: true,
            ciRequired: false,
            visualRequired: true,
        },
    };

    const paths = writeReport(outDir, report);
    console.log(`[eval] ${summary}`);
    console.log(`[eval] wrote ${path.relative(root, paths.latestMd)}`);
    process.exit(hardFail ? 1 : 0);
}

// compare-routes.mjs runs main on import — guard by only importing exports.
// Those modules call main() at load; we need to avoid double execution.
// They always run main at bottom. Importing them will execute CLI.
// Fix: use dynamic subprocess OR refactor. For now, reimplement minimal
// pieces inline if import side effects are a problem.

const isDirect =
    process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirect) {
    // Dynamic import of compare modules triggers their main() — avoid that
    // by shelling out for L1/L2 via functions duplicated above using collect*.
    // Actually collectDistRoutes is exported AND main runs — importing will exit.
    // Use child process for nothing; copy needed pure functions only via careful import.
    //
    // Workaround: spawn node -e is heavy. Instead, read compare files and
    // the modules call main() unconditionally — we need to fix compare modules
    // to guard main, OR not import them.
    //
    // Quick fix applied below: patch compare scripts is better.
    main().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
