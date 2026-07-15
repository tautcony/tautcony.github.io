/**
 * Last-modified map helpers for Astro posts.
 *
 * Frozen source of truth: `src/data/lastmod.json` (keyed by content entry ID).
 * Docker / CI without full git history must use --check only (never regenerate).
 *
 * Usage:
 *   node scripts/content/generate-lastmod.mjs --check
 *   node scripts/content/generate-lastmod.mjs --refresh   # optional: rewrite frozen map from git on src/content/posts
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const contentPostsDir = path.join(root, "src/content/posts");
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
    if (!fs.existsSync(contentPostsDir)) {
        return [];
    }
    return fs
        .readdirSync(contentPostsDir)
        .filter((name) => /\.md$/i.test(name))
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
                console.warn(
                    `[lastmod:check] map has extra key (ok if intentional): ${key}`
                );
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

/**
 * Optional: refresh frozen map from git history of `src/content/posts`.
 * Prefer keeping the committed freeze unless intentionally updating post history.
 */
function refreshFromContentGit() {
    const files = listPostFilenames();
    if (!files.length) {
        console.error("[lastmod:refresh] no posts in src/content/posts");
        process.exit(1);
    }

    /** @type {Record<string, object>} */
    const existing = fs.existsSync(astroOutFile)
        ? JSON.parse(fs.readFileSync(astroOutFile, "utf8"))
        : {};
    /** @type {Record<string, object>} */
    const data = {};
    let ok = 0;
    for (const name of files) {
        const rel = path.posix.join("src/content/posts", name);
        const info = gitLastCommit(rel);
        if (info) {
            data[name] = info;
            ok += 1;
        } else if (existing[name]) {
            data[name] = existing[name];
            ok += 1;
        } else {
            console.warn(`[lastmod:refresh] no git history for ${rel}`);
        }
    }

    fs.mkdirSync(path.dirname(astroOutFile), { recursive: true });
    fs.writeFileSync(astroOutFile, `${JSON.stringify(data, null, 2)}\n`);
    console.log(
        `[lastmod:refresh] wrote ${ok}/${files.length} → ${path.relative(root, astroOutFile)}`
    );
}

function main() {
    const args = process.argv.slice(2);
    if (args.includes("--help") || args.includes("-h")) {
        console.log(
            "Usage: node scripts/content/generate-lastmod.mjs [--check | --refresh]"
        );
        process.exit(0);
    }
    if (args.includes("--check") || args.length === 0) {
        checkFrozen();
        return;
    }
    if (args.includes("--refresh")) {
        refreshFromContentGit();
        return;
    }
    // Legacy flag no longer regenerates Jekyll _data (M5 removed dual-stack)
    if (args.includes("--write-jekyll")) {
        console.error(
            "[lastmod] --write-jekyll removed in M5; use --check or --refresh"
        );
        process.exit(1);
    }
    console.error(`Unknown args: ${args.join(" ")}`);
    process.exit(1);
}

main();
