/**
 * Last-modified map helpers for Astro posts.
 *
 * Frozen source of truth: `src/data/lastmod.json` (keyed by source filename).
 * Docker / CI without full git history must use --check only (never regenerate).
 *
 * Usage:
 *   node scripts/generate-lastmod.mjs --check
 *   node scripts/generate-lastmod.mjs --write-jekyll   # optional dual-stack legacy
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(root, "_posts");
const contentPostsDir = path.join(root, "src/content/posts");
const jekyllOutFile = path.join(root, "_data", "lastmod.json");
const astroOutFile = path.join(root, "src/data/lastmod.json");
const EXPECTED = 42;

function formatDisplay(isoDate) {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) {
        return isoDate;
    }
    return d.toLocaleString("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function gitLastCommit(relPath) {
    try {
        const out = execFileSync(
            "git",
            ["log", "-1", "--format=%H%n%cI", "--", relPath],
            { cwd: root, encoding: "utf8" }
        ).trim();
        if (!out) {
            return null;
        }
        const [sha, date] = out.split("\n");
        if (!sha || !date) {
            return null;
        }
        return {
            sha,
            short_sha: sha.slice(0, 7),
            date,
            display: formatDisplay(date),
        };
    } catch {
        return null;
    }
}

function listPostFilenames() {
    const dirs = [contentPostsDir, postsDir].filter((d) => fs.existsSync(d));
    if (dirs.length === 0) {
        return [];
    }
    const dir = fs.existsSync(contentPostsDir) ? contentPostsDir : postsDir;
    return fs
        .readdirSync(dir)
        .filter((name) => /\.(md|markdown)$/i.test(name))
        .sort();
}

/**
 * Validate frozen Astro lastmod map (CI / Docker).
 * Does not require .git.
 */
function checkFrozen() {
    if (!fs.existsSync(astroOutFile)) {
        console.error(`[lastmod:check] missing ${path.relative(root, astroOutFile)}`);
        process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(astroOutFile, "utf8"));
    const keys = Object.keys(data);
    let failed = 0;

    if (keys.length !== EXPECTED) {
        console.error(
            `[lastmod:check] expected ${EXPECTED} entries, got ${keys.length}`
        );
        failed += 1;
    }

    const posts = listPostFilenames();
    if (posts.length) {
        for (const name of posts) {
            if (!(name in data)) {
                console.error(`[lastmod:check] missing key for post: ${name}`);
                failed += 1;
            }
        }
        for (const key of keys) {
            if (posts.length && !posts.includes(key)) {
                console.warn(`[lastmod:check] map has extra key (ok if intentional): ${key}`);
            }
        }
    }

    for (const [key, entry] of Object.entries(data)) {
        for (const field of ["sha", "short_sha", "date", "display"]) {
            if (!entry || typeof entry[field] !== "string" || !entry[field]) {
                console.error(`[lastmod:check] ${key}: missing field ${field}`);
                failed += 1;
            }
        }
    }

    if (failed) {
        console.error(`[lastmod:check] FAILED (${failed})`);
        process.exit(1);
    }
    console.log(
        `[lastmod:check] OK — ${keys.length} frozen entries in ${path.relative(root, astroOutFile)}`
    );
    process.exit(0);
}

/** Legacy Jekyll path: write `_data/lastmod.json` from git + `_posts`. */
function writeJekyll() {
    if (!fs.existsSync(postsDir)) {
        console.warn("[lastmod] _posts/ missing; writing empty map");
        fs.mkdirSync(path.dirname(jekyllOutFile), { recursive: true });
        fs.writeFileSync(jekyllOutFile, "{}\n");
        return;
    }

    const files = fs
        .readdirSync(postsDir)
        .filter((name) => /\.(md|markdown)$/i.test(name))
        .sort();

    /** @type {Record<string, { sha: string, short_sha: string, date: string, display: string }>} */
    const data = {};
    let ok = 0;
    for (const name of files) {
        const rel = path.posix.join("_posts", name);
        const info = gitLastCommit(path.join("_posts", name));
        if (info) {
            data[rel] = info;
            ok += 1;
        }
    }

    fs.mkdirSync(path.dirname(jekyllOutFile), { recursive: true });
    fs.writeFileSync(jekyllOutFile, `${JSON.stringify(data, null, 2)}\n`);
    console.log(
        `[lastmod] wrote ${ok}/${files.length} entries → ${path.relative(root, jekyllOutFile)}`
    );
}

function main() {
    const args = process.argv.slice(2);
    if (args.includes("--help") || args.includes("-h")) {
        console.log(
            "Usage: node scripts/generate-lastmod.mjs [--check | --write-jekyll]"
        );
        process.exit(0);
    }
    if (args.includes("--check")) {
        checkFrozen();
        return;
    }
    if (args.includes("--write-jekyll") || args.length === 0) {
        // Default kept as Jekyll write for historical scripts; CI uses --check.
        writeJekyll();
        return;
    }
    console.error(`Unknown args: ${args.join(" ")}`);
    process.exit(1);
}

main();
