#!/usr/bin/env node
/**
 * Map Vite's manifest.json → _data/assets.json for Jekyll Liquid templates.
 *
 * Expected keys (entry names from vite.config.mjs):
 *   tc-blog, page404, tcupdate
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifestCandidates = [
    path.join(root, "assets/build/.vite/manifest.json"),
    path.join(root, "assets/build/manifest.json"),
];

const manifestPath = manifestCandidates.find(p => fs.existsSync(p));
if (!manifestPath) {
    console.error("error: Vite manifest not found under assets/build/");
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

/** @type {Record<string, string>} entryName → manifest key */
const entrySources = {
    "tc-blog": "ts/entries/blog.ts",
    page404: "ts/entries/page404.ts",
    tcupdate: "ts/entries/tcupdate.jsx",
};

const assets = {};
for (const [name, src] of Object.entries(entrySources)) {
    const chunk = manifest[src];
    if (!chunk) {
        console.error(`error: manifest missing entry for ${src}`);
        process.exit(1);
    }
    const cssList = chunk.css || [];
    assets[name] = {
        js: `/assets/build/${chunk.file}`,
        css: cssList.length > 0 ? `/assets/build/${cssList[0]}` : null,
        imports: (chunk.imports || []).map(id => {
            const imp = manifest[id];
            return imp ? `/assets/build/${imp.file}` : null;
        }).filter(Boolean),
    };
}

const outDir = path.join(root, "_data");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "assets.json");
fs.writeFileSync(outFile, `${JSON.stringify(assets, null, 2)}\n`);
console.log(`wrote ${path.relative(root, outFile)}`);
for (const [name, meta] of Object.entries(assets)) {
    console.log(`  ${name}: js=${meta.js}${meta.css ? ` css=${meta.css}` : ""}`);
}
