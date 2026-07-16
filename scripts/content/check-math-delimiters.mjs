/**
 * Reject display-math delimiters embedded in prose. KaTeX correctly treats
 * `$$...$$` as block math; inline formulas must use `$...$`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const postsDir = path.join(root, "src/content/posts");
const violations = [];

for (const name of fs.readdirSync(postsDir).sort()) {
    if (!/\.(?:md|markdown)$/i.test(name)) continue;
    const lines = fs.readFileSync(path.join(postsDir, name), "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
        if (!line.includes("$$")) return;
        const value = line.trim();
        const delimiterOnly = value === "$$";
        const singleLineDisplay = /^\$\$.+\$\$(?:\s*\(\d+\))?$/.test(value);
        if (!delimiterOnly && !singleLineDisplay) {
            violations.push(`${name}:${index + 1}`);
        }
    });
}

if (violations.length > 0) {
    console.error("Inline formulas must use $...$; found prose containing $$...$$:");
    for (const location of violations) console.error(`  - ${location}`);
    process.exit(1);
}

console.log("[math:check] OK - display delimiters are block-level");
