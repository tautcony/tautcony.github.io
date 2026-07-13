/**
 * Migrate `_posts` → `src/content/posts` for Astro Content Layer.
 * Dual-stack: never deletes or moves `_posts`.
 *
 * Usage:
 *   node scripts/migrate-posts.mjs --self-test
 *   node scripts/migrate-posts.mjs --check-fixtures
 *   node scripts/migrate-posts.mjs --dry-run
 *   node scripts/migrate-posts.mjs --write
 *   node scripts/migrate-posts.mjs --write --freeze-lastmod
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
/** @type {typeof import("js-yaml")} */
const yaml = require("js-yaml");

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(root, "_posts");
const outDir = path.join(root, "src/content/posts");
const legacyJson = path.join(root, "mig/fixtures/legacy-post-urls.json");
const legacyTxt = path.join(root, "mig/fixtures/legacy-post-urls.txt");
const jekyllLastmod = path.join(root, "_data/lastmod.json");
const astroLastmod = path.join(root, "src/data/lastmod.json");
const excerptsOut = path.join(root, "mig/fixtures/excerpts.json");

const EXPECTED_POST_COUNT = 42;
const EXCERPT_SEP = "<!--more-->";

export function listPostFiles(dir = postsDir) {
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir)
        .filter((name) => /\.(md|markdown)$/i.test(name))
        .sort();
}

export function loadLegacyMap(filePath = legacyJson) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`legacy map missing: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function checkFixtures() {
    const errors = [];
    const files = listPostFiles();
    if (files.length !== EXPECTED_POST_COUNT) {
        errors.push(`_posts count ${files.length} !== ${EXPECTED_POST_COUNT}`);
    }

    if (!fs.existsSync(legacyJson)) {
        errors.push(`missing ${path.relative(root, legacyJson)}`);
        return { ok: false, errors };
    }

    const map = loadLegacyMap();
    const keys = Object.keys(map);
    if (keys.length !== EXPECTED_POST_COUNT) {
        errors.push(`legacy-post-urls.json keys ${keys.length} !== ${EXPECTED_POST_COUNT}`);
    }

    const urls = Object.values(map);
    const uniqUrls = new Set(urls);
    if (uniqUrls.size !== urls.length) {
        errors.push("legacy-post-urls.json has duplicate URLs");
    }

    for (const f of files) {
        if (!(f in map)) errors.push(`legacy map missing key for post file: ${f}`);
    }
    for (const k of keys) {
        if (!files.includes(k)) errors.push(`legacy map key has no _posts file: ${k}`);
        const u = map[k];
        if (typeof u !== "string" || !u.startsWith("/") || !u.endsWith("/")) {
            errors.push(`bad URL for ${k}: ${u}`);
        }
    }

    const known = "2017-04-23-14th-ZJ-Programming-Contest.markdown";
    if (map[known] && map[known] !== "/2017/04/24/14th-ZJ-Programming-Contest/") {
        errors.push(`known date-mismatch URL wrong for ${known}: ${map[known]}`);
    }

    if (fs.existsSync(legacyTxt)) {
        const lines = fs
            .readFileSync(legacyTxt, "utf8")
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
        if (lines.length !== EXPECTED_POST_COUNT) {
            errors.push(`legacy-post-urls.txt lines ${lines.length} !== ${EXPECTED_POST_COUNT}`);
        }
        for (const u of urls) {
            if (!lines.includes(u)) errors.push(`txt missing URL ${u}`);
        }
    } else {
        errors.push(`missing ${path.relative(root, legacyTxt)}`);
    }

    return { ok: errors.length === 0, errors };
}

function stripBom(text) {
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function stripHtml(html) {
    return String(html)
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        const y = value.getUTCFullYear();
        const m = String(value.getUTCMonth() + 1).padStart(2, "0");
        const d = String(value.getUTCDate()).padStart(2, "0");
        // js-yaml may parse bare dates as UTC midnight
        return `${y}-${m}-${d}`;
    }
    if (typeof value === "string") {
        const m = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
        if (m) return m[1];
    }
    if (typeof value === "number") {
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) {
            return normalizeDate(d);
        }
    }
    throw new Error(`Cannot normalize date: ${JSON.stringify(value)}`);
}

function normalizeTags(tags) {
    if (tags == null) return [];
    if (!Array.isArray(tags)) return [];
    return tags
        .map((t) => (t == null ? "" : String(t).trim()))
        .filter((t) => t.length > 0);
}

function normalizeNullableString(value) {
    if (value == null) return undefined;
    if (typeof value === "string" && value.trim() === "") return undefined;
    return String(value);
}

/**
 * Convert Liquid pdf-embed include to static HTML consumed by pdf-embed.ts.
 */
export function convertPdfEmbeds(body) {
    const re =
        /\{%\s*include\s+pdf-embed\.html\s+([\s\S]*?)%\}/g;
    return body.replace(re, (_full, attrSrc) => {
        const attrs = {};
        const attrRe = /(\w+)=("([^"]*)"|'([^']*)'|(\S+))/g;
        let m;
        while ((m = attrRe.exec(attrSrc)) !== null) {
            attrs[m[1]] = m[3] ?? m[4] ?? m[5] ?? "";
        }
        const file = attrs.file || attrs.src || "";
        const height = attrs.height || "500";
        const title = attrs.title || "PDF 预览";
        const esc = (s) =>
            String(s)
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        if (!file) {
            throw new Error("pdf-embed include missing file/src");
        }
        return [
            `<div`,
            `  class="pdf-embed"`,
            `  data-pdf-file="${esc(file)}"`,
            `  data-pdf-height="${esc(height)}"`,
            `  data-pdf-title="${esc(title)}"`,
            `  style="min-height: ${esc(height)}px;"`,
            `>`,
            `  <div class="pdf-embed__placeholder">`,
            `    <p class="pdf-embed__label">${esc(title)}（按需加载，点击后才会拉取 PDF.js）</p>`,
            `    <button type="button" class="pdf-embed__button">加载 PDF 预览</button>`,
            `    <p class="pdf-embed__alt">`,
            `      <a href="${esc(file)}" target="_blank" rel="noopener">直接打开 / 下载 PDF</a>`,
            `    </p>`,
            `  </div>`,
            `</div>`,
        ].join("\n");
    });
}

export function assertNoLiquid(body, filename) {
    if (/\{\%/.test(body) || /\{\{/.test(body)) {
        throw new Error(`Liquid residual in ${filename}`);
    }
}

/**
 * Jekyll-like truncate: strip HTML then cut to length (words not required).
 */
export function makeExcerpt(body, maxLen = 256) {
    const raw = body.includes(EXCERPT_SEP) ? body.split(EXCERPT_SEP)[0] : body;
    const text = stripHtml(raw).replace(/\s+/g, " ").trim();
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trimEnd();
}

/**
 * @param {string} filename
 * @param {string} raw
 */
export function transformPost(filename, raw) {
    const text = stripBom(raw);
    const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!fmMatch) {
        throw new Error(`No front matter: ${filename}`);
    }
    /** @type {Record<string, any>} */
    const fm = yaml.load(fmMatch[1], { schema: yaml.DEFAULT_SCHEMA }) || {};
    let body = fmMatch[2];

    const titleRaw = fm.title != null ? String(fm.title) : "";
    const hasHtmlTitle = /<[^>]+>/.test(titleRaw);
    const title = hasHtmlTitle ? stripHtml(titleRaw) : titleRaw;
    const titleHtml = hasHtmlTitle ? titleRaw : undefined;

    const publishedDate = normalizeDate(fm.date);
    const tags = normalizeTags(fm.tags);

    /** @type {Record<string, any>} */
    const nextFm = {
        title,
        subtitle: fm.subtitle != null ? String(fm.subtitle) : "",
        publishedDate,
        author: normalizeNullableString(fm.author),
        headerImg: normalizeNullableString(fm["header-img"] ?? fm.headerImg),
        headerMask: fm["header-mask"] ?? fm.headerMask ?? undefined,
        headerStyle: normalizeNullableString(fm["header-style"] ?? fm.headerStyle),
        catalog: Boolean(fm.catalog),
        math: fm.math === undefined ? undefined : Boolean(fm.math),
        tags,
        sourceFilename: filename,
        legacyPath: `_posts/${filename}`,
    };

    if (titleHtml) nextFm.titleHtml = titleHtml;

    if (fm.image && typeof fm.image === "object") {
        const credit = normalizeNullableString(fm.image.credit);
        const creditlink = normalizeNullableString(fm.image.creditlink);
        if (credit || creditlink) {
            nextFm.image = {};
            if (credit) nextFm.image.credit = credit;
            if (creditlink) nextFm.image.creditlink = creditlink;
        }
    }

    // Drop undefined keys for clean YAML
    for (const k of Object.keys(nextFm)) {
        if (nextFm[k] === undefined) delete nextFm[k];
    }

    body = convertPdfEmbeds(body);
    assertNoLiquid(body, filename);

    const excerpt = makeExcerpt(body);

    const yamlOut = yaml.dump(nextFm, {
        lineWidth: 120,
        noRefs: true,
        sortingKeys: false,
    });

    const content = `---\n${yamlOut}---\n${body.startsWith("\n") ? body : `\n${body}`}`;
    return { content, excerpt, data: nextFm };
}

export function freezeLastmodFromJekyll() {
    if (!fs.existsSync(jekyllLastmod)) {
        throw new Error(
            `Missing ${path.relative(root, jekyllLastmod)}; run npm run lastmod first`
        );
    }
    const src = JSON.parse(fs.readFileSync(jekyllLastmod, "utf8"));
    /** @type {Record<string, any>} */
    const out = {};
    for (const [legacyPath, info] of Object.entries(src)) {
        const sourceFilename = String(legacyPath).replace(/^_posts\//, "");
        out[sourceFilename] = {
            legacyPath: String(legacyPath).startsWith("_posts/")
                ? legacyPath
                : `_posts/${sourceFilename}`,
            sha: info.sha,
            short_sha: info.short_sha,
            date: info.date,
            display: info.display,
        };
    }
    const n = Object.keys(out).length;
    if (n < EXPECTED_POST_COUNT) {
        throw new Error(`lastmod freeze has ${n} < ${EXPECTED_POST_COUNT} entries`);
    }
    fs.mkdirSync(path.dirname(astroLastmod), { recursive: true });
    fs.writeFileSync(astroLastmod, `${JSON.stringify(out, null, 2)}\n`);
    return { path: astroLastmod, count: n };
}

/**
 * @param {{ dryRun?: boolean, freezeLastmod?: boolean }} opts
 */
export function migratePosts({ dryRun = true, freezeLastmod = false } = {}) {
    const { ok, errors } = checkFixtures();
    if (!ok) {
        return { ok: false, errors, written: 0 };
    }

    const files = listPostFiles();
    const legacy = loadLegacyMap();
    /** @type {Record<string, string>} */
    const excerpts = {};
    const reports = [];
    const outputs = [];

    for (const filename of files) {
        const raw = fs.readFileSync(path.join(postsDir, filename), "utf8");
        try {
            const result = transformPost(filename, raw);
            if (!(filename in legacy)) {
                throw new Error(`No legacy URL for ${filename}`);
            }
            excerpts[filename] = result.excerpt;
            reports.push({
                file: filename,
                publishedDate: result.data.publishedDate,
                url: legacy[filename],
                catalog: result.data.catalog,
                titleHtml: Boolean(result.data.titleHtml),
            });
            outputs.push({ filename, content: result.content });
        } catch (e) {
            return {
                ok: false,
                errors: [`${filename}: ${e instanceof Error ? e.message : e}`],
                written: 0,
            };
        }
    }

    if (dryRun) {
        return {
            ok: true,
            errors: [],
            written: 0,
            planned: outputs.length,
            outDir,
            dryRun: true,
            reports,
            message: `Would migrate ${outputs.length} posts → ${path.relative(root, outDir)}`,
        };
    }

    fs.mkdirSync(outDir, { recursive: true });
    // Remove previous migrated posts only under outDir (not _posts)
    for (const name of fs.readdirSync(outDir)) {
        if (/\.(md|markdown)$/i.test(name)) {
            fs.unlinkSync(path.join(outDir, name));
        }
    }

    for (const { filename, content } of outputs) {
        fs.writeFileSync(path.join(outDir, filename), content, "utf8");
    }

    fs.mkdirSync(path.dirname(excerptsOut), { recursive: true });
    fs.writeFileSync(excerptsOut, `${JSON.stringify(excerpts, null, 2)}\n`);

    let lastmodInfo = null;
    if (freezeLastmod) {
        lastmodInfo = freezeLastmodFromJekyll();
    }

    // Final liquid scan on output dir
    for (const filename of listPostFiles(outDir)) {
        const body = fs.readFileSync(path.join(outDir, filename), "utf8");
        // front matter may not contain liquid; scan full file
        if (/\{\%/.test(body) || (/\{\{/.test(body) && !body.includes("{{"))) {
            // second condition always false — use simple residual check on body only
        }
        const parts = body.split(/^---$/m);
        const contentBody = parts.length >= 3 ? parts.slice(2).join("---") : body;
        if (/\{\%/.test(contentBody) || /\{\{/.test(contentBody)) {
            return {
                ok: false,
                errors: [`Liquid residual after write: ${filename}`],
                written: outputs.length,
            };
        }
    }

    return {
        ok: true,
        errors: [],
        written: outputs.length,
        planned: outputs.length,
        outDir,
        dryRun: false,
        reports,
        excerptsPath: excerptsOut,
        lastmod: lastmodInfo,
        message: `Migrated ${outputs.length} posts → ${path.relative(root, outDir)}`,
    };
}

function parseArgs(argv) {
    const out = {
        selfTest: false,
        checkFixtures: false,
        dryRun: false,
        write: false,
        freezeLastmod: false,
        help: false,
    };
    for (const a of argv) {
        if (a === "--self-test") out.selfTest = true;
        else if (a === "--check-fixtures") out.checkFixtures = true;
        else if (a === "--dry-run") out.dryRun = true;
        else if (a === "--write") out.write = true;
        else if (a === "--freeze-lastmod") out.freezeLastmod = true;
        else if (a === "--help" || a === "-h") out.help = true;
    }
    return out;
}

function selfTest() {
    const { ok, errors } = checkFixtures();
    if (!ok) {
        console.error("[migrate-posts] fixture check FAILED");
        for (const e of errors) console.error(`  - ${e}`);
        process.exit(1);
    }

    // Unit: pdf embed + HTML title + BOM date
    const pdfIn =
        '{% include pdf-embed.html file="/attach/x.pdf" height="500" title="T" %}';
    const pdfOut = convertPdfEmbeds(pdfIn);
    if (!pdfOut.includes('class="pdf-embed"') || pdfOut.includes("{%")) {
        console.error("[migrate-posts] pdf convert self-test failed");
        process.exit(1);
    }

    const sample = `---
layout: post
title: "<em>Hi</em> There"
date: 2017-04-24
tags:
  - a
  - 
header-img: null
---

Hello

<!--more-->

{% include pdf-embed.html file="/attach/x.pdf" height="400" title="Doc" %}
`;
    const t = transformPost("sample.markdown", sample);
    if (t.data.title !== "Hi There" || !t.data.titleHtml) {
        console.error("[migrate-posts] titleHtml self-test failed", t.data);
        process.exit(1);
    }
    if (t.data.headerImg !== undefined) {
        console.error("[migrate-posts] null headerImg self-test failed");
        process.exit(1);
    }
    if (t.content.includes("{%")) {
        console.error("[migrate-posts] liquid residual self-test failed");
        process.exit(1);
    }
    if (t.data.publishedDate !== "2017-04-24") {
        console.error("[migrate-posts] date self-test failed", t.data.publishedDate);
        process.exit(1);
    }

    // Dry-run all posts
    const plan = migratePosts({ dryRun: true });
    if (!plan.ok || plan.planned !== EXPECTED_POST_COUNT) {
        console.error("[migrate-posts] dry-run plan failed", plan);
        process.exit(1);
    }

    console.log(
        `[migrate-posts] self-test OK (${EXPECTED_POST_COUNT} posts, transform+fixtures)`
    );
    process.exit(0);
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        console.log(
            "Usage: node scripts/migrate-posts.mjs [--self-test|--check-fixtures|--dry-run|--write] [--freeze-lastmod]"
        );
        process.exit(0);
    }
    if (args.selfTest) {
        selfTest();
        return;
    }
    if (args.checkFixtures || (!args.dryRun && !args.write)) {
        const { ok, errors } = checkFixtures();
        if (!ok) {
            console.error("[migrate-posts] fixture check FAILED");
            for (const e of errors) console.error(`  - ${e}`);
            process.exit(1);
        }
        console.log(`[migrate-posts] fixtures OK (${EXPECTED_POST_COUNT})`);
        if (!args.dryRun && !args.write) process.exit(0);
    }

    const result = migratePosts({
        dryRun: !args.write,
        freezeLastmod: args.write && args.freezeLastmod,
    });
    if (!result.ok) {
        console.error("[migrate-posts] FAILED");
        for (const e of result.errors) console.error(`  - ${e}`);
        process.exit(1);
    }
    console.log(result.message || `[migrate-posts] wrote ${result.written}`);
    if (result.lastmod) {
        console.log(
            `[migrate-posts] froze lastmod ${result.lastmod.count} → ${path.relative(root, result.lastmod.path)}`
        );
    }
    if (result.excerptsPath && args.write) {
        console.log(`[migrate-posts] excerpts → ${path.relative(root, result.excerptsPath)}`);
    }
    process.exit(0);
}

main();
