/**
 * Build-time last-modified map for Jekyll posts (git history).
 * Writes `_data/lastmod.json` keyed by page.path (`_posts/...`).
 *
 * Usage: node scripts/generate-lastmod.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(root, "_posts");
const outFile = path.join(root, "_data", "lastmod.json");

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

function main() {
    if (!fs.existsSync(postsDir)) {
        console.warn("[lastmod] _posts/ missing; writing empty map");
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, "{}\n");
        return;
    }

    const files = fs
        .readdirSync(postsDir)
        .filter(name => /\.(md|markdown)$/i.test(name))
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

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`[lastmod] wrote ${ok}/${files.length} entries → ${path.relative(root, outFile)}`);
}

main();
