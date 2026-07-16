/**
 * Last-modified map helpers for Astro posts.
 *
 * Frozen source of truth: `src/data/lastmod.json` (keyed by content entry ID).
 * Docker / CI without full git history must use --check only (never regenerate).
 *
 * Usage:
 *   node scripts/content/generate-lastmod.mjs --check
 *   node scripts/content/generate-lastmod.mjs --refresh
 *
 * Refresh rules:
 * - Path-only git ops do not count as content updates: rename (R*) and copy (C*).
 * - Prefer an existing frozen entry when history since that entry is only R/C,
 *   or when the only later path birth is A/C while the freeze still has an older edit.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const contentPostsDir = path.join(root, "src/content/posts");
const astroOutFile = path.join(root, "src/data/lastmod.json");

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

function contentSha256(buf) {
    return createHash("sha256").update(buf).digest("hex");
}

/**
 * Path-only changes: rename or copy (migration / move without a real content edit).
 * @param {string} status git name-status code (A/M/R100/C095/…)
 * @returns {boolean}
 */
function isPathOnlyChange(status) {
    return typeof status === "string" && (status.startsWith("R") || status.startsWith("C"));
}

/**
 * Walk `git log --follow` with name-status (newest first).
 * @returns {{ sha: string, date: string, status: string }[]}
 */
function gitFollowNameStatus(relPath) {
    try {
        const out = execFileSync(
            "git",
            [
                "log",
                "--follow",
                "--name-status",
                "--format=%H%n%cI",
                "--",
                relPath,
            ],
            { cwd: root, encoding: "utf8" }
        ).trim();
        if (!out) return [];

        /** @type {{ sha: string, date: string, status: string }[]} */
        const commits = [];
        const lines = out.split("\n");
        let i = 0;
        while (i < lines.length) {
            const sha = lines[i]?.trim();
            const date = lines[i + 1]?.trim();
            if (!sha || !date) break;
            i += 2;
            // Skip blank line that git may insert after format block
            while (i < lines.length && lines[i].trim() === "") i += 1;
            // name-status line(s) until next 40-char sha or end
            let status = "M";
            while (i < lines.length) {
                const line = lines[i];
                if (/^[0-9a-f]{40}$/i.test(line.trim())) break;
                const m = line.match(/^([AMDCRTUXB][0-9]*)\t/);
                if (m) {
                    status = m[1];
                    // Prefer a content status (A/M/…) if multiple paths listed
                    if (!isPathOnlyChange(status)) break;
                }
                i += 1;
            }
            commits.push({ sha, date, status });
            // advance past remaining name-status lines for this commit
            while (i < lines.length && !/^[0-9a-f]{40}$/i.test(lines[i].trim())) {
                i += 1;
            }
        }
        return commits;
    } catch {
        return [];
    }
}

/**
 * @returns {{ sha: string, short_sha: string, date: string, display: string, content_sha256?: string } | null}
 */
function entryFromCommit(c) {
    if (!c) return null;
    return {
        sha: c.sha,
        short_sha: c.sha.slice(0, 7),
        date: c.date,
        display: formatDisplay(c.date),
    };
}

/**
 * Decide lastmod for one post: skip R/C path moves; keep freeze when only those happened after it.
 * @param {string} relPath
 * @param {object | undefined} existing
 * @param {string} fileHash sha256 of working tree file
 */
function resolveLastmod(relPath, existing, fileHash) {
    const commits = gitFollowNameStatus(relPath);
    const lastContent = commits.find(c => !isPathOnlyChange(c.status)) ?? null;

    // Fast path: content bytes unchanged since last refresh that recorded content_sha256
    if (existing?.content_sha256 && existing.content_sha256 === fileHash) {
        return {
            sha: existing.sha,
            short_sha: existing.short_sha,
            date: existing.date,
            display: existing.display,
            content_sha256: fileHash,
        };
    }

    if (!existing) {
        const e = entryFromCommit(lastContent);
        return e ? { ...e, content_sha256: fileHash } : null;
    }

    // Walk newest → older: any real content change before we hit the existing sha?
    let sawContentAfterExisting = false;
    let foundExisting = false;
    for (const c of commits) {
        if (c.sha === existing.sha) {
            // Existing pointed at a path-only commit (stale refresh) — ignore and keep walking.
            if (isPathOnlyChange(c.status)) continue;
            foundExisting = true;
            break;
        }
        if (!isPathOnlyChange(c.status)) {
            sawContentAfterExisting = true;
            break;
        }
    }

    if (foundExisting && !sawContentAfterExisting) {
        return {
            sha: existing.sha,
            short_sha: existing.short_sha,
            date: existing.date,
            display: existing.display,
            content_sha256: fileHash,
        };
    }

    // Freeze not found on follow chain: keep if only later path birth (A/C) is newer.
    if (!foundExisting && lastContent && existing.date) {
        const existingTime = Date.parse(existing.date);
        const contentTime = Date.parse(lastContent.date);
        const pathBirth =
            lastContent.status.startsWith("A") || lastContent.status.startsWith("C");
        if (
            pathBirth &&
            !Number.isNaN(existingTime) &&
            !Number.isNaN(contentTime) &&
            existingTime < contentTime
        ) {
            return {
                sha: existing.sha,
                short_sha: existing.short_sha,
                date: existing.date,
                display: existing.display,
                content_sha256: fileHash,
            };
        }
    }

    if (sawContentAfterExisting || !existing.date) {
        const e = entryFromCommit(lastContent);
        return e
            ? { ...e, content_sha256: fileHash }
            : {
                  sha: existing.sha,
                  short_sha: existing.short_sha,
                  date: existing.date,
                  display: existing.display,
                  content_sha256: fileHash,
              };
    }

    // Default: keep freeze
    return {
        sha: existing.sha,
        short_sha: existing.short_sha,
        date: existing.date,
        display: existing.display,
        content_sha256: fileHash,
    };
}

function listPostFilenames() {
    if (!fs.existsSync(contentPostsDir)) {
        return [];
    }
    return fs
        .readdirSync(contentPostsDir)
        .filter(name => /\.md$/i.test(name))
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
 * Refresh frozen map from git history of `src/content/posts`.
 * Pure renames/copies do not bump lastmod; historical freezes are preserved across moves.
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
    let kept = 0;
    let updated = 0;

    for (const name of files) {
        const rel = path.posix.join("src/content/posts", name);
        const abs = path.join(root, rel);
        const fileHash = contentSha256(fs.readFileSync(abs));
        const prev = existing[name];
        const info = resolveLastmod(rel, prev, fileHash);

        if (info) {
            data[name] = info;
            ok += 1;
            if (
                prev &&
                prev.sha === info.sha &&
                prev.date === info.date
            ) {
                kept += 1;
            } else if (prev) {
                updated += 1;
            } else {
                updated += 1;
            }
        } else if (prev) {
            data[name] = { ...prev, content_sha256: fileHash };
            ok += 1;
            kept += 1;
        } else {
            console.warn(`[lastmod:refresh] no git history for ${rel}`);
        }
    }

    // Preserve key order: existing keys first (stable), then any new names sorted
    /** @type {Record<string, object>} */
    const ordered = {};
    for (const key of Object.keys(existing)) {
        if (data[key]) ordered[key] = data[key];
    }
    for (const name of files) {
        if (data[name] && !ordered[name]) ordered[name] = data[name];
    }

    fs.mkdirSync(path.dirname(astroOutFile), { recursive: true });
    fs.writeFileSync(astroOutFile, `${JSON.stringify(ordered, null, 2)}\n`);
    console.log(
        `[lastmod:refresh] wrote ${ok}/${files.length} → ${path.relative(root, astroOutFile)}` +
            ` (kept ${kept}, changed ${updated})`
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
    console.error(`Unknown args: ${args.join(" ")}`);
    console.error("Usage: --check | --refresh");
    process.exit(1);
}

main();
