/**
 * Build / check footer quotes.
 *
 * Source of truth: src/data/quotes.yml
 * Generated:      public/json/quote.json  (fetched at runtime by quote.ts)
 *
 * Usage:
 *   node scripts/content/build-quotes.mjs           # write public JSON
 *   node scripts/content/build-quotes.mjs --check    # fail if public is stale
 *   node scripts/content/build-quotes.mjs --self-test
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";

const root = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const SOURCE = path.join(root, "src/data/quotes.yml");
const OUT = path.join(root, "public/json/quote.json");

/**
 * @typedef {{ text: string[], author: string, source?: string }} QuoteEntry
 */

/**
 * @param {unknown} raw
 * @returns {QuoteEntry[]}
 */
export function normalizeQuotes(raw) {
    if (!Array.isArray(raw)) {
        throw new Error("quotes source must be a YAML list");
    }
    if (raw.length === 0) {
        throw new Error("quotes list must not be empty");
    }

    return raw.map((item, i) => {
        if (item === null || typeof item !== "object" || Array.isArray(item)) {
            throw new Error(`quotes[${i}]: expected a mapping`);
        }
        const author = item.author;
        if (typeof author !== "string" || !author.trim()) {
            throw new Error(`quotes[${i}]: author is required`);
        }

        const textRaw = item.text;
        if (!Array.isArray(textRaw) || textRaw.length === 0) {
            throw new Error(`quotes[${i}]: text must be a non-empty list`);
        }
        const text = textRaw.map((line, j) => {
            if (typeof line !== "string" || !line.trim()) {
                throw new Error(`quotes[${i}].text[${j}]: non-empty string required`);
            }
            return line;
        });

        /** @type {QuoteEntry} */
        const entry = { text, author: author.trim() };
        if (item.source !== undefined && item.source !== null && item.source !== "") {
            if (typeof item.source !== "string") {
                throw new Error(`quotes[${i}]: source must be a string when set`);
            }
            entry.source = item.source;
        }
        return entry;
    });
}

/**
 * Stable pretty JSON for git-friendly diffs.
 * @param {QuoteEntry[]} quotes
 */
export function serializeQuotes(quotes) {
    return `${JSON.stringify(quotes, null, 4)}\n`;
}

/**
 * @param {string} sourcePath
 * @returns {QuoteEntry[]}
 */
export function loadQuotesFromYaml(sourcePath) {
    const text = fs.readFileSync(sourcePath, "utf8");
    const raw = loadYaml(text, { filename: sourcePath });
    return normalizeQuotes(raw);
}

function parseArgs(argv) {
    const out = { check: false, selfTest: false, help: false };
    for (const a of argv) {
        if (a === "--check") out.check = true;
        else if (a === "--self-test") out.selfTest = true;
        else if (a === "--help" || a === "-h") out.help = true;
    }
    return out;
}

function selfTest() {
    let failed = 0;
    try {
        normalizeQuotes([]);
        console.error("expected empty list to throw");
        failed += 1;
    } catch {
        /* ok */
    }

    const ok = normalizeQuotes([
        { author: "A", text: ["one"] },
        { author: "B", source: "S", text: ["two", "three"] },
        { author: "C", source: "", text: ["four"] },
    ]);
    if (ok.length !== 3 || ok[0].source !== undefined || ok[1].source !== "S" || ok[2].source !== undefined) {
        console.error("normalizeQuotes optional source failed", ok);
        failed += 1;
    }

    try {
        normalizeQuotes([{ author: "x", text: [] }]);
        console.error("expected empty text to throw");
        failed += 1;
    } catch {
        /* ok */
    }

    if (failed) {
        console.error(`[build-quotes] self-test FAILED (${failed})`);
        process.exit(1);
    }
    console.log("[build-quotes] self-test OK");
    process.exit(0);
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        console.log("Usage: node scripts/content/build-quotes.mjs [--check] [--self-test]");
        process.exit(0);
    }
    if (args.selfTest) {
        selfTest();
    }

    if (!fs.existsSync(SOURCE)) {
        console.error(`[build-quotes] missing source: ${path.relative(root, SOURCE)}`);
        process.exit(1);
    }

    const quotes = loadQuotesFromYaml(SOURCE);
    const body = serializeQuotes(quotes);

    if (args.check) {
        if (!fs.existsSync(OUT)) {
            console.error(`[build-quotes] missing ${path.relative(root, OUT)}; run npm run quotes:build`);
            process.exit(1);
        }
        const current = fs.readFileSync(OUT, "utf8");
        if (current !== body) {
            console.error(
                `[build-quotes] ${path.relative(root, OUT)} is out of date with ${path.relative(root, SOURCE)}`
            );
            console.error("Run: npm run quotes:build");
            process.exit(1);
        }
        console.log(`[build-quotes] check OK — ${quotes.length} entries`);
        process.exit(0);
    }

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, body, "utf8");
    console.log(`[build-quotes] wrote ${path.relative(root, OUT)} (${quotes.length} entries)`);
}

main();
