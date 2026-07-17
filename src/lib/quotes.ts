/**
 * Footer quotes: parse `src/data/quotes.yml` (bundled via Vite `?raw`).
 * Served at `/json/quote.json` by `src/pages/json/quote.json.ts` (build + dev).
 */
import { load as loadYaml } from "js-yaml";
import yamlSource from "../data/quotes.yml?raw";

export interface QuoteEntry {
    text: string[];
    author: string;
    /** Optional work / speech title. */
    source?: string;
}

export function normalizeQuotes(raw: unknown): QuoteEntry[] {
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
        const row = item as Record<string, unknown>;
        const author = row.author;
        if (typeof author !== "string" || !author.trim()) {
            throw new Error(`quotes[${i}]: author is required`);
        }

        const textRaw = row.text;
        if (!Array.isArray(textRaw) || textRaw.length === 0) {
            throw new Error(`quotes[${i}]: text must be a non-empty list`);
        }
        const text = textRaw.map((line, j) => {
            if (typeof line !== "string" || !line.trim()) {
                throw new Error(`quotes[${i}].text[${j}]: non-empty string required`);
            }
            return line;
        });

        const entry: QuoteEntry = { text, author: author.trim() };
        if (row.source !== undefined && row.source !== null && row.source !== "") {
            if (typeof row.source !== "string") {
                throw new Error(`quotes[${i}]: source must be a string when set`);
            }
            entry.source = row.source;
        }
        return entry;
    });
}

/** Stable pretty JSON for the static endpoint. */
export function serializeQuotes(quotes: readonly QuoteEntry[]): string {
    return `${JSON.stringify(quotes, null, 4)}\n`;
}

/** Parse the bundled YAML source of truth. */
export function loadQuotes(): QuoteEntry[] {
    const raw = loadYaml(yamlSource, { filename: "quotes.yml" });
    return normalizeQuotes(raw);
}
