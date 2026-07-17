/**
 * Footer quote rotation. Initial paint is SSG (`Footer.astro`);
 * quotes payload is `#site-quotes` JSON (no network fetch).
 */

export interface QuoteEntry {
    text: string[];
    author: string;
    source?: string;
}

export interface QuoteOptions {
    /** Root `.quote` selector. */
    quoteSelector?: string;
    /** Rotation interval in milliseconds. */
    intervalMs?: number;
    /** JSON script id produced by Footer. */
    dataScriptId?: string;
}

function parseQuotePayload(data: unknown): QuoteEntry[] {
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

function readQuotesFromDom(scriptId: string): QuoteEntry[] {
    const el = document.getElementById(scriptId);
    if (!(el instanceof HTMLScriptElement) || !el.textContent?.trim()) {
        throw new Error(`#${scriptId} missing or empty`);
    }
    return parseQuotePayload(JSON.parse(el.textContent) as unknown);
}

function pickRandom<T>(items: readonly T[]): T | undefined {
    if (items.length === 0) {
        return undefined;
    }
    return items[Math.floor(Math.random() * items.length)];
}

function formatAttribution(quote: QuoteEntry): string {
    let author = `—— ${quote.author}`;
    if (quote.source) {
        author += `《${quote.source}》`;
    }
    return author;
}

class QuoteRotator {
    private readonly content: HTMLElement;
    private readonly author: HTMLElement;
    private quotes: QuoteEntry[] = [];
    private timerId: number | undefined;

    public constructor(content: HTMLElement, author: HTMLElement) {
        this.content = content;
        this.author = author;
    }

    public start(quotes: QuoteEntry[], intervalMs: number): void {
        this.quotes = quotes;
        if (this.quotes.length === 0) {
            return;
        }
        // First interval only — SSG already painted the initial line.
        this.timerId = window.setInterval(() => this.paint(), intervalMs);
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
        this.content.textContent = pickRandom(quote.text) ?? "";
        this.author.textContent = formatAttribution(quote);
    }
}

const DEFAULTS = {
    quoteSelector: "footer .quote",
    intervalMs: 10_000,
    dataScriptId: "site-quotes",
} as const;

export function init(options: QuoteOptions = {}): void {
    const root = document.querySelector<HTMLElement>(
        options.quoteSelector ?? DEFAULTS.quoteSelector
    );
    const content = root?.querySelector<HTMLElement>(".quote-content");
    const author = root?.querySelector<HTMLElement>(".quote-author");
    if (!root || !content || !author) {
        return;
    }

    let quotes: QuoteEntry[];
    try {
        quotes = readQuotesFromDom(options.dataScriptId ?? DEFAULTS.dataScriptId);
    } catch (error) {
        console.warn("Failed to read site quotes", error);
        return;
    }

    new QuoteRotator(content, author).start(
        quotes,
        options.intervalMs ?? DEFAULTS.intervalMs
    );
}
