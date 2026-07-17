import { el } from "../lib/dom";

/** One author/work with one or more interchangeable lines. */
export interface QuoteEntry {
    text: string[];
    author: string;
    /** Optional work / speech title; omitted when unknown. */
    source?: string;
}

export interface QuoteOptions {
    containerSelector?: string;
    className?: string;
    /** Rotation interval in milliseconds. */
    intervalMs?: number;
}

async function fetchJson(url: string): Promise<unknown> {
    const response = await fetch(url, { credentials: "omit" });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return response.json() as Promise<unknown>;
}

/**
 * Accept either a bare array (`/json/quote.json` from Astro) or `{ quotes: [...] }`.
 */
export function parseQuotePayload(data: unknown): QuoteEntry[] {
    const list = Array.isArray(data)
        ? data
        : data !== null && typeof data === "object" && Array.isArray((data as { quotes?: unknown }).quotes)
            ? (data as { quotes: unknown[] }).quotes
            : null;
    if (!list) {
        throw new Error("quote payload must be an array or { quotes: [] }");
    }

    return list.map((item, index) => {
        if (item === null || typeof item !== "object" || Array.isArray(item)) {
            throw new Error(`quote[${index}] must be an object`);
        }
        const record = item as Record<string, unknown>;
        const author = record.author;
        const text = record.text;
        if (typeof author !== "string" || !author.trim()) {
            throw new Error(`quote[${index}].author required`);
        }
        if (!Array.isArray(text) || text.length === 0 || !text.every(line => typeof line === "string" && line.trim())) {
            throw new Error(`quote[${index}].text must be a non-empty string array`);
        }
        const entry: QuoteEntry = {
            author: author.trim(),
            text: text as string[],
        };
        if (typeof record.source === "string" && record.source.trim()) {
            entry.source = record.source;
        }
        return entry;
    });
}

function pickRandom<T>(items: readonly T[]): T | undefined {
    if (items.length === 0) {
        return undefined;
    }
    return items[Math.floor(Math.random() * items.length)];
}

class QuoteRotator {
    private readonly content: HTMLElement;
    private readonly author: HTMLElement;
    private quotes: QuoteEntry[] = [];
    private timerId: number | undefined;

    public constructor(containerSelector: string, className: string) {
        this.content = el("div", {
            class: "quote-content",
            style: { marginTop: "2em" },
        });
        this.author = el("div", {
            class: "quote-author",
            style: {
                marginLeft: "16em",
                fontSize: "85%",
            },
        });
        const container = el("div", { class: className }, this.content, this.author);
        document.querySelector(containerSelector)?.append(container);
    }

    public start(intervalMs: number): void {
        void this.loadQuotes().then(() => {
            this.paint();
            this.timerId = window.setInterval(() => this.paint(), intervalMs);
        });
    }

    private paint(): void {
        const quote = pickRandom(this.quotes);
        if (quote === undefined) {
            if (this.timerId !== undefined) {
                clearInterval(this.timerId);
                this.timerId = undefined;
            }
            return;
        }
        const line = pickRandom(quote.text) ?? "";
        let author = `—— ${quote.author}`;
        if (quote.source) {
            author += `《${quote.source}》`;
        }
        this.content.textContent = line;
        this.author.textContent = author;
    }

    private async loadQuotes(): Promise<void> {
        const baseMeta = document.head.querySelector("meta[name=baseurl]");
        const baseUrl = baseMeta instanceof HTMLMetaElement ? baseMeta.content : "";
        // Built/served by `src/pages/json/quote.json.ts` from `src/data/quotes.yml`.
        const url = `${baseUrl}/json/quote.json`;

        try {
            this.quotes = parseQuotePayload(await fetchJson(url));
        } catch (error) {
            console.warn("Failed to load quote.json", error);
        }
    }
}

const DEFAULTS = {
    containerSelector: ".copyright",
    className: "quote",
    intervalMs: 10_000,
} as const;

export function init(options: QuoteOptions = {}): void {
    const rotator = new QuoteRotator(
        options.containerSelector ?? DEFAULTS.containerSelector,
        options.className ?? DEFAULTS.className
    );
    rotator.start(options.intervalMs ?? DEFAULTS.intervalMs);
}
