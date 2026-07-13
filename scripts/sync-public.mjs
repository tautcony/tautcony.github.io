/**
 * Dual-stack: mirror root static assets into `public/` for Astro.
 * Does NOT delete or move sources at repo root (M0–M4 rule).
 *
 * Usage: node scripts/sync-public.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, "public");

/** Directories / files copied root → public (see mig/02, mig/07 M0). */
const ENTRIES = [
    "img",
    "attach",
    "fonts",
    "css",
    "json",
    "arknights",
    "contents",
    "CNAME",
    "favicon.ico",
];

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const name of fs.readdirSync(src)) {
            if (name === ".DS_Store") continue;
            copyRecursive(path.join(src, name), path.join(dest, name));
        }
        return;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
}

function writeRobotsTxt() {
    const body = "Sitemap: https://tautcony.xyz/sitemap.xml\n";
    fs.writeFileSync(path.join(publicDir, "robots.txt"), body);
}

function main() {
    fs.mkdirSync(publicDir, { recursive: true });
    let copied = 0;
    const missing = [];

    for (const entry of ENTRIES) {
        const src = path.join(root, entry);
        const dest = path.join(publicDir, entry);
        if (!fs.existsSync(src)) {
            missing.push(entry);
            continue;
        }
        if (fs.existsSync(dest)) {
            fs.rmSync(dest, { recursive: true, force: true });
        }
        copyRecursive(src, dest);
        copied += 1;
    }

    writeRobotsTxt();

    console.log(
        `[sync-public] copied ${copied}/${ENTRIES.length} entries → public/`
    );
    if (missing.length) {
        console.warn(`[sync-public] missing sources: ${missing.join(", ")}`);
    }
    console.log("[sync-public] wrote public/robots.txt (production sitemap)");
}

main();
